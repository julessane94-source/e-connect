"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, FileText, Save } from "lucide-react";
import { PDFGenerator } from "@/services/pdf/pdfGenerator";

type RequestItem = {
  id: string;
  reference: string;
  type: string;
  subject: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string | null;
  commune?: string | null;
  status: string;
};

const templates = [
  { id: "attestation-residence", name: "Attestation de résidence", type: "Attestation" },
  { id: "certificat-naissance", name: "Certificat de naissance", type: "Certificat" },
  { id: "extrait-naissance", name: "Extrait de naissance", type: "Extrait" },
  { id: "certificat-mariage", name: "Certificat de mariage", type: "Certificat" },
  { id: "certificat-administratif", name: "Certificat administratif", type: "Certificat" },
  { id: "autorisation-municipale", name: "Autorisation municipale", type: "Autorisation" },
];

export default function GenerationDocuments() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    date: "",
    lieu: "",
    reference: "",
    objet: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selected = templates.find((template) => template.id === selectedTemplate) ?? templates[0];
  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId),
    [requests, selectedRequestId]
  );
  const content = `${selected.name}

Référence demande : ${selectedRequest?.reference || formData.reference || "À générer"}
Objet : ${formData.objet || selectedRequest?.subject || "-"}
Type de demande : ${selectedRequest?.type || selected.name}
Citoyen : ${formData.prenom} ${formData.nom}
Commune : ${formData.lieu || selectedRequest?.commune || "-"}
Date : ${formData.date || new Date().toLocaleDateString("fr-FR")}

Après vérification du dossier, le présent document est établi par le service communal compétent.

Document généré par Agent Connect.`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const fillFromRequest = (request?: RequestItem) => {
    if (!request) return;
    const [prenom = "", ...nomParts] = request.citizenName.split(" ");
    setFormData({
      nom: nomParts.join(" "),
      prenom,
      date: new Date().toISOString().slice(0, 10),
      lieu: request.commune || "",
      reference: request.reference,
      objet: request.subject,
    });
  };

  const handleGenerate = async () => {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${selected.name} - ${selectedRequest?.reference || `${formData.prenom} ${formData.nom}`}`.trim(),
        type: selected.type,
        category: selectedRequest?.type || selected.name,
        content,
        requestId: selectedRequestId || undefined,
      }),
    });

    setSaving(false);

    if (response.ok) {
      await PDFGenerator.generateText(content, `${selected.name}.pdf`);
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
      fillFromRequest(loadedRequests.find((request) => request.id === initial));
    };

    loadRequests();
  }, []);

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    fillFromRequest(requests.find((request) => request.id === requestId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Génération de documents</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Créer un document officiel lié à une demande assignée.</p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card-modern p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Demande liée</h2>
            <select
              value={selectedRequestId}
              onChange={(event) => handleSelectRequest(event.target.value)}
              className="input-modern w-full"
            >
              <option value="">Document sans demande liée</option>
              {requests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.reference} - {request.subject} - {request.citizenName}
                </option>
              ))}
            </select>
          </div>

          <div className="card-modern p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Modèles</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedTemplate === template.id
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-800 dark:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{template.name}</p>
                      <p className="text-sm text-gray-500">{template.type}</p>
                    </div>
                    {selectedTemplate === template.id && <Check className="text-green-600" size={18} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card-modern p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Informations</h2>
          <div className="space-y-4">
            {[
              ["prenom", "Prénom"],
              ["nom", "Nom"],
              ["date", "Date"],
              ["lieu", "Commune"],
              ["reference", "Référence"],
              ["objet", "Objet"],
            ].map(([name, label]) => (
              <label key={name} className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <input
                  type={name === "date" ? "date" : "text"}
                  name={name}
                  value={formData[name as keyof typeof formData]}
                  onChange={handleChange}
                  className="input-modern w-full"
                />
              </label>
            ))}
            <button onClick={handleGenerate} disabled={saving} className="btn-primary flex w-full items-center justify-center gap-2">
              <Save size={18} />
              {saving ? "Enregistrement..." : "Générer et enregistrer"}
            </button>
          </div>
        </div>
      </div>

      <div className="card-modern p-6">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <FileText size={18} />
          Aperçu
        </h2>
        <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">{content}</pre>
      </div>
    </div>
  );
}
