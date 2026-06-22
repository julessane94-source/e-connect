"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, FileText, Loader2, Save } from "lucide-react";
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

export default function GenerationDocuments() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [content, setContent] = useState("");
  const [templateName, setTemplateName] = useState("Modèle standard");
  const [saving, setSaving] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [message, setMessage] = useState("");

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId),
    [requests, selectedRequestId]
  );

  const renderServerTemplate = async (request?: RequestItem) => {
    if (!request) {
      setContent(fallbackTemplate);
      setTemplateName("Modèle standard");
      return;
    }

    setRendering(true);
    setMessage("");
    const response = await fetch(`/api/demandes/${request.id}/render-template`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    setRendering(false);

    if (response.ok) {
      setContent(payload.content || fillFallback(request));
      setTemplateName(payload.templateName || request.requestType?.templateName || "Modèle standard");
      return;
    }

    setContent(fillFallback(request));
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
        content,
        requestId: selectedRequestId,
      }),
    });

    setSaving(false);

    if (response.ok) {
      await PDFGenerator.generateText(content, `${selectedRequest.reference}.pdf`);
      router.push("/documents");
      return;
    }

    setMessage("Impossible d'enregistrer le document.");
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
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={24}
            className="input-modern w-full font-mono text-sm leading-7"
          />
        </div>
      </div>
    </div>
  );
}
