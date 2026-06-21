"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, XCircle, Upload, FileText, User, Mail, Phone, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { sedhiouCommunes } from "@/lib/sedhiou";

export default function NouvelleDemande() {
  const router = useRouter();
  const { data: session } = useSession();
  const [requestTypes, setRequestTypes] = useState<Array<{ id: string; name: string; category: string; price: number }>>([]);
  const [formData, setFormData] = useState({
    requestTypeId: "",
    type: "",
    subject: "",
    description: "",
    citizenName: "",
    citizenEmail: "",
    citizenPhone: "",
    commune: "",
    attachmentName: "",
    attachmentMimeType: "",
    attachmentSize: "",
    attachmentData: "",
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

  const handleFile = async (file?: File) => {
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setFormData({
      ...formData,
      attachmentName: file.name,
      attachmentMimeType: file.type,
      attachmentSize: String(file.size),
      attachmentData: dataUrl,
    });
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
                name="requestTypeId"
                value={formData.requestTypeId}
                onChange={handleChange}
                className="input-modern w-full"
                required
              >
                <option value="">Sélectionner</option>
                {requestTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.price.toLocaleString("fr-FR")} FCFA
                  </option>
                ))}
              </select>
              {selectedRequestType && (
                <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
                  Coût de la demande : {selectedRequestType.price.toLocaleString("fr-FR")} FCFA
                </p>
              )}
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
                Commune concernée *
              </label>
              <select
                name="commune"
                value={formData.commune}
                onChange={handleChange}
                className="input-modern w-full"
                required
              >
                <option value="">Sélectionner une commune de Sédhiou</option>
                {sedhiouCommunes.map((commune) => (
                  <option key={`${commune.department}-${commune.name}`} value={commune.name}>
                    {commune.name} - Département de {commune.department}
                  </option>
                ))}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Pièce jointe
              </label>
              <input
                type="file"
                onChange={(event) => handleFile(event.target.files?.[0])}
                className="input-modern w-full"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Ajoutez une copie ou un justificatif utile au traitement de la demande.
              </p>
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
  const selectedRequestType = useMemo(
    () => requestTypes.find((type) => type.id === formData.requestTypeId),
    [requestTypes, formData.requestTypeId]
  );

  useEffect(() => {
    const loadTypes = async () => {
      const response = await fetch("/api/request-types", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setRequestTypes(data.types ?? []);
      }
    };

    loadTypes();
  }, []);
