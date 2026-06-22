"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, ImagePlus, Save, Trash2 } from "lucide-react";

type HeroImage = {
  src: string;
  title: string;
  caption: string;
};

type MunicipalityForm = {
  name: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  mayorName: string;
  openingHours: string;
  heroTitle: string;
  heroSubtitle: string;
  heroAnnouncement: string;
  heroImages: HeroImage[];
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
  heroTitle: "",
  heroSubtitle: "",
  heroAnnouncement: "",
  heroImages: [],
};

export default function MairieSettings() {
  const [formData, setFormData] = useState<MunicipalityForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const response = await fetch("/api/municipality", { cache: "no-store" });
      if (!response.ok) return;
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
        heroTitle: data.profile.heroTitle || "",
        heroSubtitle: data.profile.heroSubtitle || "",
        heroAnnouncement: data.profile.heroAnnouncement || "",
        heroImages: Array.isArray(data.profile.heroImages) ? data.profile.heroImages : [],
      });
    };
    loadProfile();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const updateHeroImage = (index: number, field: keyof HeroImage, value: string) => {
    setFormData((current) => ({
      ...current,
      heroImages: current.heroImages.map((image, imageIndex) => (imageIndex === index ? { ...image, [field]: value } : image)),
    }));
  };

  const addHeroImage = () => {
    setFormData((current) => ({
      ...current,
      heroImages: [...current.heroImages, { src: "", title: "", caption: "" }].slice(0, 6),
    }));
  };

  const removeHeroImage = (index: number) => {
    setFormData((current) => ({
      ...current,
      heroImages: current.heroImages.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleHeroFile = (index: number, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateHeroImage(index, "src", String(reader.result || ""));
    reader.readAsDataURL(file);
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
          <p className="mt-1 text-gray-600 dark:text-gray-400">Nom, contact, accueil public et diaporama.</p>
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

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <ImagePlus className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accueil et diaporama</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ces informations apparaissent sur la première page.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Grand titre">
              <input name="heroTitle" value={formData.heroTitle} onChange={handleChange} className="input-modern w-full" />
            </Field>
            <Field label="Annonce courte">
              <input name="heroAnnouncement" value={formData.heroAnnouncement} onChange={handleChange} className="input-modern w-full" />
            </Field>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Texte d'accueil</span>
              <textarea name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} className="input-modern w-full" rows={3} />
            </label>
          </div>

          <div className="mt-5 space-y-4">
            {formData.heroImages.map((image, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                <div className="grid gap-4 lg:grid-cols-[180px_1fr_auto]">
                  <div className="overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900">
                    {image.src ? <img src={image.src} alt="" className="h-32 w-full object-cover" /> : <div className="flex h-32 items-center justify-center text-sm text-gray-400">Image</div>}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={image.title} onChange={(event) => updateHeroImage(index, "title", event.target.value)} className="input-modern w-full" placeholder="Titre de l'image" />
                    <input value={image.caption} onChange={(event) => updateHeroImage(index, "caption", event.target.value)} className="input-modern w-full" placeholder="Légende" />
                    <input value={image.src} onChange={(event) => updateHeroImage(index, "src", event.target.value)} className="input-modern w-full md:col-span-2" placeholder="Lien public de l'image" />
                    <input type="file" accept="image/*" onChange={(event) => handleHeroFile(index, event.target.files?.[0])} className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-green-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-green-700 dark:text-gray-300" />
                  </div>
                  <button type="button" onClick={() => removeHeroImage(index)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addHeroImage} disabled={formData.heroImages.length >= 6} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900">
              <ImagePlus size={18} />
              Ajouter une image
            </button>
          </div>
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
