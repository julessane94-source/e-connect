"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, XCircle, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { sedhiouCommunes } from "@/lib/sedhiou";

type RequestTypeOption = {
  id: string;
  name: string;
  category: string;
  price: number;
};

export default function NouvelleDemande() {
  const router = useRouter();
  const { data: session } = useSession();
  const isCitizen = Boolean(session?.user?.id && !session.user.role);
  const lockedCommune = isCitizen ? session?.user?.commune || "" : "";
  const [requestTypes, setRequestTypes] = useState<RequestTypeOption[]>([]);
  const [formData, setFormData] = useState({
    requestTypeId: "",
    type: "",
    subject: "",
    description: "",
    citizenPhone: "",
    commune: "",
    attachmentName: "",
    attachmentMimeType: "",
    attachmentSize: "",
    attachmentData: "",
    urgency: "normal",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/demandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        commune: lockedCommune || formData.commune,
      }),
    });

    if (response.ok) {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/demandes/suivi");
      }, 1500);
      return;
    }

    const payload = await response.json().catch(() => ({}));
    setError(payload.message || "Impossible d'enregistrer la demande. Vérifiez votre connexion.");
    setLoading(false);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La pièce jointe ne doit pas dépasser 5 Mo.");
      return;
    }

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

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      citizenPhone: current.citizenPhone || session?.user?.phone || "",
      commune: lockedCommune || current.commune,
    }));
  }, [session?.user?.phone, lockedCommune]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nouvelle demande citoyenne</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Enregistrer une nouvelle demande communale</p>
        </div>
      </div>

      {success ? (
        <div className="card-modern p-12 text-center">
          <div className="mb-4 text-6xl">OK</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Demande créée avec succès</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Redirection vers le suivi de vos demandes...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-modern p-6">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {session?.user && (
            <div className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40 md:grid-cols-3">
              <Info label="Citoyen" value={session.user.name || "-"} />
              <Info label="Email" value={session.user.email || "-"} />
              <Info label="NIC" value={session.user.nic || "En attente"} />
              <Info label="Commune du compte" value={session.user.commune || "Non renseignée"} />
              <Info label="Téléphone" value={session.user.phone || "Non renseigné"} />
              <Info label="Règle" value={lockedCommune ? "Demandes limitées à cette commune" : "Commune à sélectionner"} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Type de demande *</label>
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Urgence</label>
              <select name="urgency" value={formData.urgency} onChange={handleChange} className="input-modern w-full">
                <option value="normal">Normale</option>
                <option value="urgent">Urgente</option>
                <option value="tres-urgent">Très urgente</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Commune concernée *</label>
              {lockedCommune ? (
                <input type="text" value={lockedCommune} className="input-modern w-full" readOnly />
              ) : (
                <select name="commune" value={formData.commune} onChange={handleChange} className="input-modern w-full" required>
                  <option value="">Sélectionner une commune de Sédhiou</option>
                  {sedhiouCommunes.map((commune) => (
                    <option key={`${commune.department}-${commune.name}`} value={commune.name}>
                      {commune.name} - Département de {commune.department}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Sujet *</label>
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <input
                type="tel"
                name="citizenPhone"
                value={formData.citizenPhone}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="77 123 45 67"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Date souhaitée</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-modern w-full" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Image ou justificatif</label>
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                  <ImagePlus size={18} />
                  Choisir une image
                  <input
                    type="file"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                    className="sr-only"
                    accept="image/*,.pdf"
                  />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ajoutez une image de justificatif ou un PDF. Taille maximale : 5 Mo.
                </p>
                {formData.attachmentName && (
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Fichier sélectionné : {formData.attachmentName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
