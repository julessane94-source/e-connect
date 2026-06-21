"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, FileText, Save } from "lucide-react";
import { PDFGenerator } from "@/services/pdf/pdfGenerator";

const templates = [
  { id: "certificat-naissance", name: "Certificat de naissance", type: "Certificat" },
  { id: "extrait-naissance", name: "Extrait de naissance", type: "Extrait" },
  { id: "certificat-mariage", name: "Certificat de mariage", type: "Certificat" },
  { id: "attestation-residence", name: "Attestation de résidence", type: "Attestation" },
];

export default function GenerationDocuments() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    date: "",
    lieu: "",
    reference: "",
  });
  const [saving, setSaving] = useState(false);

  const selected = templates.find((template) => template.id === selectedTemplate) ?? templates[0];
  const content = `${selected.name}

Référence : ${formData.reference || "À générer"}
Nom : ${formData.nom}
Prénom : ${formData.prenom}
Date : ${formData.date}
Lieu : ${formData.lieu}

Document généré par Agent Connect.`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleGenerate = async () => {
    setSaving(true);
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${selected.name} - ${formData.prenom} ${formData.nom}`.trim(),
        type: selected.type,
        category: selected.name,
        content,
      }),
    });

    setSaving(false);

    if (response.ok) {
      await PDFGenerator.generateText(content, `${selected.name}.pdf`);
      router.push("/documents");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Génération de documents</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Générer, enregistrer et retrouver un document plus tard.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-modern p-6 lg:col-span-2">
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

        <div className="card-modern p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Informations</h2>
          <div className="space-y-4">
            {[
              ["nom", "Nom"],
              ["prenom", "Prénom"],
              ["date", "Date"],
              ["lieu", "Lieu"],
              ["reference", "Référence"],
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
