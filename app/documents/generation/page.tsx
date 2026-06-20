"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, FileText, Plus, Download, Eye, QrCode, Printer, Check, X } from "lucide-react";

export default function GenerationDocuments() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    date: "",
    lieu: "",
    reference: ""
  });

  const templates = [
    { id: "certificat-naissance", name: "Certificat de naissance", icon: "📄", type: "Certificat" },
    { id: "extrait-naissance", name: "Extrait de naissance", icon: "📋", type: "Extrait" },
    { id: "certificat-mariage", name: "Certificat de mariage", icon: "💑", type: "Certificat" },
    { id: "extrait-mariage", name: "Extrait de mariage", icon: "📋", type: "Extrait" },
    { id: "certificat-deces", name: "Certificat de décès", icon: "🕊️", type: "Certificat" },
    { id: "attestation-residence", name: "Attestation de résidence", icon: "🏠", type: "Attestation" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = () => {
    if (!selectedTemplate) {
      alert("⚠️ Veuillez sélectionner un modèle");
      return;
    }
    alert(`✅ Document généré avec succès !\nModèle: ${templates.find(t => t.id === selectedTemplate)?.name}\nNom: ${formData.nom} ${formData.prenom}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📝 Génération de documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Générer des documents automatiquement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modèles */}
        <div className="lg:col-span-2">
          <div className="card-modern p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Sélectionner un modèle</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`card-modern p-4 cursor-pointer text-center transition-all ${
                    selectedTemplate === template.id ? "border-green-500 dark:border-green-500 shadow-lg" : ""
                  }`}
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{template.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{template.type}</p>
                  {selectedTemplate === template.id && (
                    <div className="mt-2 flex justify-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📝 Informations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="Diop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="Moussa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lieu *</label>
              <input
                type="text"
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="Dakar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Référence</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="#2024-001"
              />
            </div>
            <button 
              onClick={handleGenerate}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Générer le document
            </button>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="card-modern p-4 text-center hover:border-green-300 dark:hover:border-green-700 transition" onClick={() => alert("📥 Téléchargement en cours...")}>
          <Download size={24} className="mx-auto text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">Télécharger</p>
        </button>
        <button className="card-modern p-4 text-center hover:border-green-300 dark:hover:border-green-700 transition" onClick={() => alert("👀 Aperçu du document")}>
          <Eye size={24} className="mx-auto text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">Aperçu</p>
        </button>
        <button className="card-modern p-4 text-center hover:border-green-300 dark:hover:border-green-700 transition" onClick={() => alert("📱 QR Code généré")}>
          <QrCode size={24} className="mx-auto text-purple-600 dark:text-purple-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">QR Code</p>
        </button>
        <button className="card-modern p-4 text-center hover:border-green-300 dark:hover:border-green-700 transition" onClick={() => window.print()}>
          <Printer size={24} className="mx-auto text-orange-600 dark:text-orange-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">Imprimer</p>
        </button>
      </div>
    </div>
  );
}
