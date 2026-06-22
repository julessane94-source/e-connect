"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, Save } from "lucide-react";

type MunicipalityForm = {
  name: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  mayorName: string;
  openingHours: string;
};

const emptyForm: MunicipalityForm = {
  name: "",
  region: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  mayorName: "",
  openingHours: "",
};

export default function MairieSettings() {
  const [formData, setFormData] = useState<MunicipalityForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const response = await fetch("/api/municipality", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.profile.name || "",
          region: data.profile.region || "",
          address: data.profile.address || "",
          phone: data.profile.phone || "",
          email: data.profile.email || "",
          website: data.profile.website || "",
          mayorName: data.profile.mayorName || "",
          openingHours: data.profile.openingHours || "",
        });
      }
    };
    loadProfile();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/municipality", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setSaving(false);
    if (response.ok) setMessage("Informations de la mairie mises à jour.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/parametres" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Informations de la mairie</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Nom, contact et coordonnées publiques.</p>
        </div>
      </div>

      <form onSubmit={save} className="card-modern p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
            <Building2 className="h-5 w-5 text-green-700 dark:text-green-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formData.name || "Mairie"}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formData.address || "-"}</p>
          </div>
        </div>

        {message && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom de la mairie">
            <input name="name" value={formData.name} onChange={handleChange} className="input-modern w-full" required />
          </Field>
          <Field label="Région">
            <input name="region" value={formData.region} onChange={handleChange} className="input-modern w-full" required />
          </Field>
          <Field label="Adresse">
            <input name="address" value={formData.address} onChange={handleChange} className="input-modern w-full" required />
          </Field>
          <Field label="Téléphone">
            <input name="phone" value={formData.phone} onChange={handleChange} className="input-modern w-full" />
          </Field>
          <Field label="Email">
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-modern w-full" required />
          </Field>
          <Field label="Site web">
            <input name="website" value={formData.website} onChange={handleChange} className="input-modern w-full" />
          </Field>
          <Field label="Maire / responsable">
            <input name="mayorName" value={formData.mayorName} onChange={handleChange} className="input-modern w-full" />
          </Field>
          <Field label="Horaires">
            <input name="openingHours" value={formData.openingHours} onChange={handleChange} className="input-modern w-full" required />
          </Field>
        </div>

        <button type="submit" disabled={saving} className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-50">
          <Save size={18} />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
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
