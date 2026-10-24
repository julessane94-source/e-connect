"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlignCenter, AlignLeft, AlignRight, Bold, ChevronLeft, Download, FileText, Italic, List, ListOrdered, Loader2, Save, Underline } from "lucide-react";
import { PDFGenerator } from "@/services/pdf/pdfGenerator";

type RequestItem = {
  id: string;
  reference: string;
  type: string;
  subject: string;
  description: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string | null;
  commune?: string | null;
  status: string;
  price: number;
  attachmentExtractedText?: string | null;
  extractedInfo?: string | null;
  createdAt: string;
  requestType?: {
    name: string;
    category: string;
    templateName?: string | null;
    templateData?: string | null;
  } | null;
};

const fallbackTemplate = `Document administratif

Référence : {{reference}}
Type : {{type}}
Objet : {{subject}}
Citoyen : {{citizenName}}
Email : {{citizenEmail}}
Téléphone : {{citizenPhone}}
Commune : {{commune}}
Date : {{date}}

Informations complémentaires :
{{extractedInfo}}

Observations :
`;

function fillFallback(request?: RequestItem) {
  if (!request) return fallbackTemplate;
  const values: Record<string, string> = {
    reference: request.reference,
    type: request.type,
    subject: request.subject,
    description: request.description,
    citizenName: request.citizenName,
    citizenEmail: request.citizenEmail,
    citizenPhone: request.citizenPhone || "",
    commune: request.commune || "",
    price: String(request.price || 0),
    date: new Date().toLocaleDateString("fr-FR"),
    extractedInfo: request.extractedInfo || request.attachmentExtractedText || "",
  };

  return fallbackTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

const allowedEditorTags = new Set([
  "p", "div", "br", "strong", "b", "em", "i", "u", "s",
  "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "span",
  "a", "hr", "table", "thead", "tbody", "tfoot", "tr", "td", "th", "img",
]);

const allowedFonts = ["Arial", "Calibri", "Georgia", "Times New Roman", "Verdana", "Tahoma", "Courier New"];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeEditorHtml(value: string) {
  if (!/<\/?[a-z][\s\S]*?>/i.test(value)) {
    return value.split(/\r?\n/).map((line) => "<p>" + (line ? escapeHtml(line) : "<br>") + "</p>").join("");
  }

  const parsed = new DOMParser().parseFromString(value, "text/html");
  const sanitizeNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    if (tag === "br") return "<br>";
    if (tag === "hr") return "<hr>";
    if (tag === "img") {
      const src = element.getAttribute("src") || "";
      const alt = element.getAttribute("alt") || "";
      if (!/^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(src)) return "";
      return '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt.slice(0, 160)) + '">';
    }

    const children = Array.from(element.childNodes).map(sanitizeNode).join("");
    if (tag === "font") {
      const sizeMap: Record<string, string> = { "1": "8pt", "2": "10pt", "3": "12pt", "4": "14pt", "5": "18pt", "6": "24pt", "7": "36pt" };
      const fontSize = sizeMap[element.getAttribute("size") || ""];
      const color = element.getAttribute("color") || "";
      const safeColor = /^(#[\da-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]{3,20})$/i.test(color) ? color : "";
      const styles = [fontSize ? "font-size:" + fontSize : "", safeColor ? "color:" + safeColor : ""].filter(Boolean);
      return "<span" + (styles.length ? ' style="' + styles.join(";") + '"' : "") + ">" + children + "</span>";
    }
    if (!allowedEditorTags.has(tag)) return children;

    const styles: string[] = [];
    const textAlign = ["left", "center", "right", "justify"].includes(element.style.textAlign) ? element.style.textAlign : "";
    if (["p", "div", "h1", "h2", "h3", "blockquote", "td", "th"].includes(tag) && textAlign) {
      styles.push("text-align:" + textAlign);
    }

    const color = element.style.color;
    if (color && /^(#[\da-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]{3,20})$/i.test(color)) styles.push("color:" + color);
    const backgroundColor = element.style.backgroundColor;
    if (backgroundColor && /^(#[\da-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]{3,20})$/i.test(backgroundColor)) styles.push("background-color:" + backgroundColor);
    const fontSize = element.style.fontSize;
    if (fontSize && /^(?:[6-9]|[1-3][0-9]|4[0-8])(?:pt|px)$/i.test(fontSize)) styles.push("font-size:" + fontSize);
    const fontFamily = element.style.fontFamily.replace(/["']/g, "").split(",")[0].trim();
    if (allowedFonts.includes(fontFamily)) styles.push("font-family:" + fontFamily);

    if (tag === "a") {
      const href = element.getAttribute("href") || "";
      const safeHref = /^(https?:|mailto:|\/|#)/i.test(href) && !/^\/\//.test(href) ? href : "";
      return safeHref ? '<a href="' + escapeHtml(safeHref) + '">' + children + "</a>" : children;
    }
    if (tag === "td" || tag === "th") {
      const colspan = Number(element.getAttribute("colspan") || 1);
      const rowspan = Number(element.getAttribute("rowspan") || 1);
      const attributes = (colspan > 1 && colspan <= 20 ? ' colspan="' + colspan + '"' : "") +
        (rowspan > 1 && rowspan <= 20 ? ' rowspan="' + rowspan + '"' : "");
      return "<" + tag + attributes + (styles.length ? ' style="' + escapeHtml(styles.join(";")) + '"' : "") + ">" + children + "</" + tag + ">";
    }
    return "<" + tag + (styles.length ? ' style="' + escapeHtml(styles.join(";")) + '"' : "") + ">" + children + "</" + tag + ">";
  };

  return Array.from(parsed.body.childNodes).map(sanitizeNode).join("") || "<p><br></p>";
}

const editorTools = [
  { label: "Gras", command: "bold", icon: Bold },
  { label: "Italique", command: "italic", icon: Italic },
  { label: "Souligné", command: "underline", icon: Underline },
  { label: "Aligner à gauche", command: "justifyLeft", icon: AlignLeft },
  { label: "Centrer", command: "justifyCenter", icon: AlignCenter },
  { label: "Aligner à droite", command: "justifyRight", icon: AlignRight },
  { label: "Liste à puces", command: "insertUnorderedList", icon: List },
  { label: "Liste numérotée", command: "insertOrderedList", icon: ListOrdered },
];

export default function GenerationDocuments() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [content, setContent] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const rememberEditorSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) savedRangeRef.current = range.cloneRange();
  };

  const restoreEditorSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (selection && savedRangeRef.current && editor.contains(savedRangeRef.current.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  };

  const setEditorContent = (value: string) => {
    const safeHtml = sanitizeEditorHtml(value);
    setContent(safeHtml);
    if (editorRef.current) editorRef.current.innerHTML = safeHtml;
    savedRangeRef.current = null;
  };

  const applyEditorCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    restoreEditorSelection();
    document.execCommand(command, false, value);
    const safeHtml = sanitizeEditorHtml(editorRef.current.innerHTML);
    setContent(safeHtml);
    rememberEditorSelection();
  };

  const insertEditorHtml = (html: string) => {
    if (!editorRef.current) return;
    restoreEditorSelection();
    document.execCommand("insertHTML", false, html);
    const safeHtml = sanitizeEditorHtml(editorRef.current.innerHTML);
    setContent(safeHtml);
    rememberEditorSelection();
  };

  const insertLink = () => {
    const url = window.prompt("Adresse du lien (https://… ou mailto:…)")?.trim();
    if (!url) return;
    if (!/^https?:\\/\\//i.test(url) && !/^mailto:/i.test(url)) {
      setMessage("Saisissez une adresse HTTPS ou une adresse e-mail valide.");
      return;
    }
    applyEditorCommand("createLink", url);
  };

  const insertTable = () => {
    const rows = Array.from({ length: 3 }, () => "<tr><td><p><br></p></td><td><p><br></p></td><td><p><br></p></td></tr>").join("");
    insertEditorHtml("<table><tbody>" + rows + "</tbody></table><p><br></p>");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type) || file.size > 1024 * 1024) {
      setMessage("Choisissez une image PNG, JPEG, GIF ou WebP de 1 Mo maximum.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    insertEditorHtml('<img src="' + dataUrl + '" alt="' + escapeHtml(file.name) + '">');
  };
  const [templateName, setTemplateName] = useState("Modèle standard");
  const [saving, setSaving] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [message, setMessage] = useState("");

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId),
    [requests, selectedRequestId]
  );

  const plainContent = content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
  const wordCount = plainContent ? plainContent.split(/\s+/).filter(Boolean).length : 0;
  const characterCount = plainContent.length;

  const renderServerTemplate = async (request?: RequestItem) => {
    if (!request) {
      setEditorContent(fallbackTemplate);
      setTemplateName("Modèle standard");
      return;
    }

    setRendering(true);
    setMessage("");
    const response = await fetch(`/api/demandes/${request.id}/render-template`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    setRendering(false);

    if (response.ok) {
      setEditorContent(payload.content || fillFallback(request));
      setTemplateName(payload.templateName || request.requestType?.templateName || "Modèle standard");
      return;
    }

    setEditorContent(fillFallback(request));
    setTemplateName(request.requestType?.templateName || "Modèle standard");
    setMessage(payload.message || "Le modèle existant n'a pas pu être chargé, le modèle standard est utilisé.");
  };

  const handleGenerate = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${selectedRequest.type} - ${selectedRequest.reference}`,
        type: selectedRequest.requestType?.category || selectedRequest.type,
        category: selectedRequest.type,
        content: sanitizeEditorHtml(content),
        requestId: selectedRequestId,
      }),
    });

    setSaving(false);

    if (response.ok) {
      await PDFGenerator.generateText(sanitizeEditorHtml(content), `${selectedRequest.reference}.pdf`);
      router.push("/documents");
      return;
    }

    setMessage("Impossible d'enregistrer le document.");
  };

  const downloadWordDocument = () => {
    if (!content.trim()) return;
    const safeContent = sanitizeEditorHtml(content);
    const wordDocument = "<!DOCTYPE html><html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" xmlns=\"http://www.w3.org/TR/REC-html40\"><head><meta charset=\"utf-8\"><title>" +
      escapeHtml(selectedRequest?.subject || "Document administratif") +
      "</title><style>@page{size:21cm 29.7cm;margin:2.2cm}body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#202020;line-height:1.45}p{margin:0 0 10pt}h1{font-size:20pt}h2{font-size:16pt}h3{font-size:13pt}blockquote{margin-left:24pt;color:#555;border-left:2px solid #999;padding-left:10pt}</style></head><body>" +
      safeContent + "</body></html>";
    const blob = new Blob(["\ufeff", wordDocument], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (selectedRequest?.reference || "document") + ".doc";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadBaseTemplate = () => {
    if (!selectedRequest?.requestType?.templateData) return;
    const link = document.createElement("a");
    link.href = selectedRequest.requestType.templateData;
    link.download = selectedRequest.requestType.templateName || `${selectedRequest.reference}-modele.docx`;
    link.click();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get("requestId") || "";

    const loadRequests = async () => {
      const response = await fetch("/api/demandes", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const loadedRequests: RequestItem[] = data.requests ?? [];
      setRequests(loadedRequests);
      const initial = requestId && loadedRequests.some((request) => request.id === requestId)
        ? requestId
        : loadedRequests[0]?.id || "";
      setSelectedRequestId(initial);
      await renderServerTemplate(loadedRequests.find((item) => item.id === initial));
    };

    loadRequests();
  }, []);

  const handleSelectRequest = async (requestId: string) => {
    setSelectedRequestId(requestId);
    await renderServerTemplate(requests.find((item) => item.id === requestId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Traitement du document</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Le modèle de base est rempli automatiquement, puis l'agent peut l'ajuster.</p>
        </div>
      </div>

      {message && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{message}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-modern p-6 lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Demande à traiter</h2>
          <select value={selectedRequestId} onChange={(event) => handleSelectRequest(event.target.value)} className="input-modern w-full">
            <option value="">Sélectionner</option>
            {requests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.reference} - {request.subject}
              </option>
            ))}
          </select>
          {selectedRequest && (
            <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-900">
              <p><strong>Citoyen :</strong> {selectedRequest.citizenName}</p>
              <p><strong>Commune :</strong> {selectedRequest.commune || "-"}</p>
              <p><strong>Modèle utilisé :</strong> {templateName}</p>
              {selectedRequest.extractedInfo && (
                <p className="text-green-700 dark:text-green-300"><strong>Infos extraites :</strong> intégrées au document</p>
              )}
            </div>
          )}

          <div className="mt-5 grid gap-2">
            <button onClick={handleGenerate} disabled={saving || rendering || !selectedRequest} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50">
              {saving || rendering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
              {saving ? "Enregistrement..." : rendering ? "Chargement du modèle..." : "Générer et enregistrer"}
            </button>
            {selectedRequest?.requestType?.templateData && (
              <button type="button" onClick={downloadBaseTemplate} className="btn-secondary flex w-full items-center justify-center gap-2">
                <Download size={18} />
                Télécharger le modèle de base
              </button>
            )}
          </div>
        </div>

        <div className="card-modern p-6 lg:col-span-2">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <FileText size={18} />
              Modèle rempli à compléter
            </h2>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
              {templateName}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-950">
            <div role="toolbar" aria-label="Outils de mise en forme du document" className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900">
              <button type="button" title="Annuler" aria-label="Annuler" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEditorCommand("undo")} className="rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800">↶</button>
              <button type="button" title="Rétablir" aria-label="Rétablir" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEditorCommand("redo")} className="rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800">↷</button>
              <span className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-700" />
              <select aria-label="Police" defaultValue="Calibri" onMouseDown={rememberEditorSelection} onChange={(event) => applyEditorCommand("fontName", event.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {allowedFonts.map((font) => <option key={font} value={font}>{font}</option>)}
              </select>
              <select aria-label="Taille du texte" defaultValue="3" onMouseDown={rememberEditorSelection} onChange={(event) => applyEditorCommand("fontSize", event.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {[["1", "8"], ["2", "10"], ["3", "12"], ["4", "14"], ["5", "18"], ["6", "24"], ["7", "36"]].map(([size, label]) => <option key={size} value={size}>{label} pt</option>)}
              </select>
              {editorTools.map(({ label, command, icon: Icon }) => (
                <button key={command} type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={() => applyEditorCommand(command)} className="rounded-lg p-2 text-gray-700 transition hover:bg-white hover:text-green-700 hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-800">
                  <Icon size={17} />
                </button>
              ))}
              <label title="Couleur du texte" className="flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                A
                <input type="color" aria-label="Couleur du texte" defaultValue="#202020" onMouseDown={rememberEditorSelection} onChange={(event) => applyEditorCommand("foreColor", event.target.value)} className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" />
              </label>
              <label title="Surligner" className="flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                Surligner
                <input type="color" aria-label="Couleur de surlignage" defaultValue="#fff2a8" onMouseDown={rememberEditorSelection} onChange={(event) => applyEditorCommand("hiliteColor", event.target.value)} className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" />
              </label>
              <span className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-700" />
              {(["h1", "h2", "h3", "p"] as const).map((tag) => (
                <button key={tag} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEditorCommand("formatBlock", tag)} className="rounded-lg px-2.5 py-2 text-xs font-semibold uppercase text-gray-700 transition hover:bg-white hover:text-green-700 hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-800" aria-label={tag === "p" ? "Paragraphe" : "Titre " + tag.slice(1)} title={tag === "p" ? "Paragraphe" : "Titre " + tag.slice(1)}>
                  {tag === "p" ? "P" : tag.toUpperCase()}
                </button>
              ))}
              <button type="button" title="Citation" aria-label="Citation" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEditorCommand("formatBlock", "blockquote")} className="rounded-lg px-2 py-2 text-xs font-semibold text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800">Citation</button>
              <button type="button" title="Insérer un lien" aria-label="Insérer un lien" onMouseDown={(event) => event.preventDefault()} onClick={insertLink} className="rounded-lg px-2 py-2 text-xs font-semibold text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800">Lien</button>
              <button type="button" title="Insérer un tableau 3 par 3" aria-label="Insérer un tableau 3 par 3" onMouseDown={(event) => event.preventDefault()} onClick={insertTable} className="rounded-lg px-2 py-2 text-xs font-semibold text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800">Tableau</button>
              <button type="button" title="Ajouter une image" aria-label="Ajouter une image" onMouseDown={(event) => event.preventDefault()} onClick={() => imageInputRef.current?.click()} className="rounded-lg px-2 py-2 text-xs font-semibold text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800">Image</button>
              <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleImageUpload} className="sr-only" />
              <button type="button" title="Saut de page" aria-label="Saut de page" onMouseDown={(event) => event.preventDefault()} onClick={() => insertEditorHtml("<hr><p><br></p>")} className="rounded-lg px-2 py-2 text-xs font-semibold text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800">Saut de page</button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEditorCommand("removeFormat")} className="rounded-lg px-2 py-2 text-xs font-semibold text-gray-600 transition hover:bg-white hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Effacer le style
              </button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="Contenu du document"
              aria-multiline="true"
              spellCheck
              onInput={(event) => { setContent(sanitizeEditorHtml(event.currentTarget.innerHTML)); rememberEditorSelection(); }}
              onMouseUp={rememberEditorSelection}
              onKeyUp={rememberEditorSelection}
              className="min-h-[540px] max-h-[70vh] overflow-y-auto px-8 py-7 text-[15px] leading-7 text-gray-900 outline-none dark:text-gray-100 [&_blockquote]:border-l-4 [&_blockquote]:border-green-300 [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:mt-5 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-xl [&_h3]:font-semibold [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_img]:my-2 [&_img]:max-w-full [&_img]:h-auto [&_a]:text-green-700 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
            />
          </div>
          <div className="mt-3 flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:text-gray-400">
            <p>{wordCount} mots · {characterCount} caractères. Les images intégrées apparaissent dans le Word exporté.</p>
            <button type="button" onClick={downloadWordDocument} disabled={!content.trim()} className="btn-secondary inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <Download size={17} /> Télécharger en Word
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
