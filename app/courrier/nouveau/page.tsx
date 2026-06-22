"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, XCircle, Upload, Send, Inbox, User, Mail, FileText, Tag } from "lucide-react";
import Link from "next/link";

export default function NouveauCourrier() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: "entrant",
    sender: "",
    recipient: "",
    subject: "",
    content: "",
    priority: "normal",
    reference: "",
    category: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/courrier");
      }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/courrier" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">?? Nouveau courrier</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Créer un nouveau courrier</p>
        </div>
      </div>

      {success ? (
        <div className="card-modern p-12 text-center">
          <div className="text-6xl mb-4">?</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Courrier créé avec succès !</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Redirection vers la liste des courriers...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-modern p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Inbox size={16} className="inline mr-1" />
                Type de courrier *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-modern w-full"
                required
              >
                <option value="entrant">?? Entrant</option>
                <option value="sortant">?? Sortant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Tag size={16} className="inline mr-1" />
                Priorité
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-modern w-full"
              >
                <option value="normal">Normale</option>
                <option value="urgent">Urgente</option>
                <option value="tres-urgent">Très urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <User size={16} className="inline mr-1" />
                {formData.type === "entrant" ? "Expéditeur *" : "Destinataire *"}
              </label>
              <input
                type="text"
                name={formData.type === "entrant" ? "sender" : "recipient"}
                value={formData.type === "entrant" ? formData.sender : formData.recipient}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder={formData.type === "entrant" ? "Expéditeur" : "Destinataire"}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FileText size={16} className="inline mr-1" />
                Référence
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="Réf. #2026-001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Mail size={16} className="inline mr-1" />
                Objet *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="Objet du courrier"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Contenu *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="input-modern w-full"
                placeholder="Contenu du courrier..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Upload size={16} className="inline mr-1" />
                Pièce jointe
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-green-500 transition cursor-pointer">
                <Upload className="mx-auto text-gray-400" size={24} />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Glissez ou cliquez pour ajouter un fichier
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, JPG (max 10MB)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer
                </>
              )}
            </button>
            <button type="reset" className="btn-secondary flex items-center gap-2">
              <XCircle size={18} />
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
