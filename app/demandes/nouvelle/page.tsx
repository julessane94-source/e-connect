"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ImagePlus, Save, XCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { sedhiouCommunes } from "@/lib/sedhiou";

type RequestTypeOption = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  templateName?: string | null;
};

const requestTypeImages: Record<string, string> = {
  "État civil": "/request-types/etat-civil.svg",
  "Résidence": "/request-types/residence.svg",
  "Administration": "/request-types/administration.svg",
  "Courrier": "/request-types/courrier.svg",
};

function imageForType(type: RequestTypeOption) {
  if (type.category.includes("civil")) return requestTypeImages["État civil"];
  if (type.category.includes("Résidence") || type.name.toLowerCase().includes("résidence") || type.name.toLowerCase().includes("domicile")) {
    return requestTypeImages["Résidence"];
  }
  if (type.category.includes("Courrier")) return requestTypeImages.Courrier;
  return requestTypeImages.Administration;
}

export default function NouvelleDemande() {
  const router = useRouter();
  const { data: session } = useSession();
  const isCitizen = Boolean(session?.user?.id && !session.user.role);
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
    paymentMethod: "REMOTE",
    withdrawalMethod: "DOWNLOAD",
    urgency: "normal",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedRequestType = useMemo(
    () => requestTypes.find((type) => type.id === formData.requestTypeId),
    [requestTypes, formData.requestTypeId]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const selectRequestType = (type: RequestTypeOption) => {
    setFormData((current) => ({
      ...current,
      requestTypeId: type.id,
      type: type.name,
      subject: current.subject || type.name,
    }));
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
        commune: formData.commune,
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
      commune: current.commune || session?.user?.commune || "",
    }));
  }, [session?.user?.phone, session?.user?.commune]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const commune = params.get("commune");
    const typeCode = params.get("type");

    if (commune && sedhiouCommunes.some((item) => item.name === commune)) {
      setFormData((current) => ({ ...current, commune }));
    }

    if (typeCode && requestTypes.length > 0) {
      const requestType = requestTypes.find((item) => item.code === typeCode);
      if (requestType) {
        setFormData((current) => ({
          ...current,
          requestTypeId: requestType.id,
          type: requestType.name,
          subject: current.subject || requestType.name,
        }));
      }
    }
  }, [requestTypes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nouvelle demande citoyenne</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Choisissez un service, joignez une image et envoyez votre demande.</p>
        </div>
      </div>

      {success ? (
        <div className="card-modern p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Demande créée avec succès</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Redirection vers le suivi de vos demandes...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {session?.user && (
            <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:grid-cols-3">
              <Info label="Citoyen" value={session.user.name || "-"} />
              <Info label="NIC" value={session.user.nic || "En attente"} />
              <Info label="Commune du compte" value={session.user.commune || "Non renseignée"} />
            </div>
          )}

          <section className="card-modern p-6">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Objet de la demande</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliquez sur une image pour sélectionner le service.</p>
              </div>
              {selectedRequestType && (
                <p className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {selectedRequestType.price.toLocaleString("fr-FR")} FCFA
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requestTypes.map((type) => {
                const selected = formData.requestTypeId === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => selectRequestType(type)}
                    className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 ${
                      selected ? "border-green-500 ring-2 ring-green-200" : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <img src={imageForType(type)} alt="" className="h-28 w-full object-cover" />
                    <div className="p-4">
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{type.category}</p>
                      <h3 className="mt-1 font-semibold text-gray-900 dark:text-white">{type.name}</h3>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          {type.price.toLocaleString("fr-FR")} FCFA
                        </span>
                        {type.templateName && <span className="text-xs text-gray-500">modèle prêt</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="requestTypeId" value={formData.requestTypeId} required />
          </section>

          <section className="card-modern p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceButton
                    active={formData.paymentMethod === "REMOTE"}
                    label="À distance"
                    onClick={() => setFormData({ ...formData, paymentMethod: "REMOTE" })}
                  />
                  <ChoiceButton
                    active={formData.paymentMethod === "COUNTER"}
                    label="Au guichet"
                    onClick={() => setFormData({ ...formData, paymentMethod: "COUNTER" })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Retrait</label>
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceButton
                    active={formData.withdrawalMethod === "DOWNLOAD"}
                    label="Télécharger"
                    onClick={() => setFormData({ ...formData, withdrawalMethod: "DOWNLOAD" })}
                  />
                  <ChoiceButton
                    active={formData.withdrawalMethod === "COUNTER"}
                    label="Guichet"
                    onClick={() => setFormData({ ...formData, withdrawalMethod: "COUNTER" })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Urgence</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange} className="input-modern w-full">
                  <option value="normal">Normale</option>
                  <option value="urgent">Urgente</option>
                  <option value="tres-urgent">Très urgente</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Commune concernée *</label>
                <select name="commune" value={formData.commune} onChange={handleChange} className="input-modern w-full" required>
                  <option value="">Selectionner une commune de Sedhiou</option>
                  {sedhiouCommunes.map((commune) => (
                    <option key={`${commune.department}-${commune.name}`} value={commune.name}>
                      {commune.name} - Departement de {commune.department}
                    </option>
                  ))}
                </select>
                {isCitizen && session?.user?.commune && session.user.commune !== formData.commune && (
                  <p className="mt-2 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                    Commune de votre compte : {session.user.commune}. La demande sera envoyee a {formData.commune || "la commune selectionnee"}.
                  </p>
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
                    <input type="file" onChange={(event) => handleFile(event.target.files?.[0])} className="sr-only" accept="image/*,.pdf" />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ajoutez une image de justificatif ou un PDF. Taille maximale : 5 Mo.</p>
                  {formData.attachmentName && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Fichier sélectionné : {formData.attachmentName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button type="submit" disabled={loading || !formData.requestTypeId} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Envoyer la demande
                  </>
                )}
              </button>
              <button type="reset" className="btn-secondary flex items-center gap-2">
                <XCircle size={18} />
                Annuler
              </button>
            </div>
          </section>
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

function ChoiceButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
        active
          ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}
