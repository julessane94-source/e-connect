"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, Save } from "lucide-react";
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

function renderTemplate(template: string | null | undefined, request?: RequestItem) {
  const fallback = `Document administratif

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
  if (!request) return fallback;

  let templateText = template || fallback;
  if (templateText.startsWith("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
    templateText = fallback;
  } else if (templateText.startsWith("data:text/") && templateText.includes(",")) {
    try {
      templateText = decodeURIComponent(escape(atob(templateText.split(",")[1] || "")));
    } catch {
      templateText = fallback;
    }
  }

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

  return templateText.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

export default function GenerationDocuments() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId),
    [requests, selectedRequestId]
  );

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
      const request = loadedRequests.find((item) => item.id === initial);
      setContent(renderTemplate(request?.requestType?.templateData, request));
    };

    loadRequests();
  }, []);

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    const request = requests.find((item) => item.id === requestId);
    setContent(renderTemplate(request?.requestType?.templateData, request));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Génération de documents</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Modèle rempli automatiquement, ajustable avant enregistrement.</p>
        </div>
      </div>

      {message && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-modern p-6 lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Demande</h2>
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
              <p><strong>Modèle :</strong> {selectedRequest.requestType?.templateName || "Standard"}</p>
              {selectedRequest.extractedInfo && (
                <p className="text-green-700 dark:text-green-300"><strong>Infos extraites :</strong> présentes</p>
              )}
            </div>
          )}
          <button onClick={handleGenerate} disabled={saving || !selectedRequest} className="btn-primary mt-5 flex w-full items-center justify-center gap-2 disabled:opacity-50">
            <Save size={18} />
            {saving ? "Enregistrement..." : "Générer et enregistrer"}
          </button>
        </div>

        <div className="card-modern p-6 lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <FileText size={18} />
            Document
          </h2>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={22}
            className="input-modern w-full font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
