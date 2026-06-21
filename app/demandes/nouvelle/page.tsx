"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, XCircle, Upload, FileText, User, Mail, Phone, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NouvelleDemande() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    type: "",
    subject: "",
    description: "",
    citizenName: "",
    citizenEmail: "",
    citizenPhone: "",
    urgency: "normal",
    date: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/demandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/demandes/suivi");
      }, 1500);
    } else {
      setLoading(false);
      alert("Impossible d'enregistrer la demande. Vérifiez votre connexion.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📝 Nouvelle demande citoyenne</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Enregistrer une nouvelle demande</p>
        </div>
      </div>

      {success ? (
        <div className="card-modern p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Demande créée avec succès !</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Redirection vers le suivi de vos demandes...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-modern p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Type de demande *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-modern w-full"
                required
              >
                <option value="">Sélectionner</option>
                <option value="certificat">Certificat de naissance</option>
                <option value="extrait">Extrait de naissance</option>
                <option value="mariage">Certificat de mariage</option>
                <option value="residence">Certificat de résidence</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Urgence
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="input-modern w-full"
              >
                <option value="normal">Normale</option>
                <option value="urgent">Urgente</option>
                <option value="tres-urgent">Très urgente</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Sujet *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="Objet de la demande"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-modern w-full"
                placeholder="Décrivez votre demande..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nom du citoyen *
              </label>
              <input
                type="text"
                name="citizenName"
                value={session?.user?.name || formData.citizenName}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="Nom complet"
                readOnly={Boolean(session?.user?.name)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email du citoyen *
              </label>
              <input
                type="email"
                name="citizenEmail"
                value={session?.user?.email || formData.citizenEmail}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="email@exemple.com"
                readOnly={Boolean(session?.user?.email)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                name="citizenPhone"
                value={formData.citizenPhone}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="77 123 45 67"
              />
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
