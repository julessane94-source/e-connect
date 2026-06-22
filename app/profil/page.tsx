"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BadgeCheck, Calendar, ChevronLeft, Hash, Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import { sedhiouCommunes } from "@/lib/sedhiou";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  commune: string;
  registryNumber: string;
  birthDate: string;
  nic: string;
};

const emptyProfile: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  commune: "",
  registryNumber: "",
  birthDate: "",
  nic: "",
};

export default function ProfilPage() {
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const response = await fetch("/api/me", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          commune: data.user.commune || "",
          registryNumber: data.user.registryNumber || "",
          birthDate: data.user.birthDate || "",
          nic: data.user.nic || "",
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.message || "Impossible de mettre à jour le profil");
      setSaving(false);
      return;
    }

    setFormData({
      firstName: payload.user.firstName || "",
      lastName: payload.user.lastName || "",
      email: payload.user.email || "",
      phone: payload.user.phone || "",
      commune: payload.user.commune || "",
      registryNumber: payload.user.registryNumber || "",
      birthDate: payload.user.birthDate || "",
      nic: payload.user.nic || "",
    });
    await update({
      ...session,
      user: {
        ...session?.user,
        name: payload.user.name,
        phone: payload.user.phone,
        commune: payload.user.commune,
        registryNumber: payload.user.registryNumber,
        nic: payload.user.nic,
      },
    });
    setMessage("Profil mis à jour.");
    setSaving(false);
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-8"><div className="card-modern p-8">Chargement du profil...</div></div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon profil citoyen</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Vos informations servent à préremplir les demandes et à générer votre NIC.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-modern p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
            <UserRound className="h-8 w-8 text-green-700 dark:text-green-300" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            {formData.firstName} {formData.lastName}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>
          <div className="mt-5 space-y-3">
            <Info icon={BadgeCheck} label="NIC" value={formData.nic || "Non généré"} />
            <Info icon={MapPin} label="Commune" value={formData.commune || "Non renseignée"} />
            <Info icon={Hash} label="Registre" value={formData.registryNumber || "Non renseigné"} />
          </div>
        </div>

        <form onSubmit={saveProfile} className="card-modern p-6 lg:col-span-2">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations personnelles</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">La commune choisie limite les demandes que vous pouvez déposer.</p>
          </div>

          {message && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Prénom">
              <input name="firstName" value={formData.firstName} onChange={handleChange} className="input-modern w-full" required />
            </Field>
            <Field label="Nom">
              <input name="lastName" value={formData.lastName} onChange={handleChange} className="input-modern w-full" required />
            </Field>
            <Field label="Email">
              <input value={formData.email} className="input-modern w-full bg-gray-50 dark:bg-gray-900" readOnly />
            </Field>
            <Field label="Téléphone">
              <input name="phone" value={formData.phone} onChange={handleChange} className="input-modern w-full" />
            </Field>
            <Field label="Numéro de registre">
              <input name="registryNumber" value={formData.registryNumber} onChange={handleChange} className="input-modern w-full" required />
            </Field>
            <Field label="Date de naissance">
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-modern w-full" required />
            </Field>
            <Field label="Commune">
              <select name="commune" value={formData.commune} onChange={handleChange} className="input-modern w-full" required>
                <option value="">Choisir une commune</option>
                {sedhiouCommunes.map((commune) => (
                  <option key={`${commune.department}-${commune.name}`} value={commune.name}>
                    {commune.name} - {commune.department}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button type="submit" disabled={saving} className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-50">
            <Save size={18} />
            {saving ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/60">
      <Icon className="mt-0.5 h-4 w-4 text-green-700 dark:text-green-300" />
      <div>
        <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
