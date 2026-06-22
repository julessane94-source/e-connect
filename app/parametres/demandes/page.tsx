"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronLeft, Download, FileUp, Save, Trash2 } from "lucide-react";

type RequestType = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  templateName?: string | null;
  templateMimeType?: string | null;
  templateSize?: number | null;
  templateData?: string | null;
};

export default function ParametresDemandes() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [types, setTypes] = useState<RequestType[]>([]);
  const [newType, setNewType] = useState({ name: "", category: "Administration", price: 0 });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadTypes = async () => {
    const response = await fetch("/api/request-types", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setTypes(data.types ?? []);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const updateType = async (type: RequestType) => {
    setSavingId(type.id);
    setMessage("");
    const response = await fetch("/api/request-types", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(type),
    });
    setSavingId(null);
    if (response.ok) {
      setMessage("Type de demande mis à jour.");
      await loadTypes();
    }
  };

  const handleTemplate = async (type: RequestType, file?: File) => {
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const nextType = {
      ...type,
      templateName: file.name,
      templateMimeType: file.type || "application/octet-stream",
      templateSize: file.size,
      templateData: dataUrl,
    };
    setTypes(types.map((item) => (item.id === type.id ? nextType : item)));
    await updateType(nextType);
  };

  const removeTemplate = async (type: RequestType) => {
    await updateType({
      ...type,
      templateName: null,
      templateMimeType: null,
      templateSize: null,
      templateData: null,
    });
  };

  const downloadTemplate = (type: RequestType) => {
    if (!type.templateData) return;
    const link = document.createElement("a");
    link.href = type.templateData;
    link.download = type.templateName || `${type.code}.docx`;
    link.click();
  };

  const createType = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/request-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newType),
    });
    if (response.ok) {
      setNewType({ name: "", category: "Administration", price: 0 });
      setMessage("Nouveau type de demande ajouté.");
      await loadTypes();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/parametres" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Types, tarifs et modèles</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Les tarifs sont visibles par les citoyens. Les modèles Word/PDF servent de base aux agents.
          </p>
        </div>
      </div>

      {message && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

      {isAdmin && (
        <form onSubmit={createType} className="card-modern p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Ajouter un type de demande</h2>
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_160px_auto] md:items-end">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Libellé</span>
              <input value={newType.name} onChange={(event) => setNewType({ ...newType, name: event.target.value })} className="input-modern w-full" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</span>
              <input value={newType.category} onChange={(event) => setNewType({ ...newType, category: event.target.value })} className="input-modern w-full" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Prix</span>
              <input type="number" min="0" value={newType.price} onChange={(event) => setNewType({ ...newType, price: Number(event.target.value) })} className="input-modern w-full" />
            </label>
            <button type="submit" className="btn-primary">Ajouter</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {types.map((type) => (
          <div key={type.id} className="card-modern p-5">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_160px_1.2fr_auto] lg:items-end">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</span>
                <input
                  className="input-modern w-full"
                  value={type.name}
                  disabled={!isAdmin}
                  onChange={(event) => setTypes(types.map((item) => item.id === type.id ? { ...item, name: event.target.value } : item))}
                />
                <span className="mt-1 block text-xs text-gray-400">{type.code}</span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</span>
                <input
                  className="input-modern w-full"
                  value={type.category}
                  disabled={!isAdmin}
                  onChange={(event) => setTypes(types.map((item) => item.id === type.id ? { ...item, category: event.target.value } : item))}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Prix FCFA</span>
                <input
                  type="number"
                  min="0"
                  className="input-modern w-full"
                  value={type.price}
                  disabled={!isAdmin}
                  onChange={(event) => setTypes(types.map((item) => item.id === type.id ? { ...item, price: Number(event.target.value) } : item))}
                />
              </label>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Modèle de base</span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                    <FileUp size={16} />
                    Téléverser
                    <input
                      type="file"
                      className="sr-only"
                      accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                      onChange={(event) => handleTemplate(type, event.target.files?.[0])}
                    />
                  </label>
                  {type.templateData && (
                    <>
                      <button type="button" onClick={() => downloadTemplate(type)} className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200">
                        <Download size={16} />
                        Word
                      </button>
                      <button type="button" onClick={() => removeTemplate(type)} className="rounded-xl bg-red-100 p-2 text-red-700 hover:bg-red-200" title="Retirer le modèle">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{type.templateName || "Aucun modèle téléversé"}</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={type.isActive}
                    disabled={!isAdmin}
                    onChange={(event) => setTypes(types.map((item) => item.id === type.id ? { ...item, isActive: event.target.checked } : item))}
                  />
                  Actif
                </label>
                <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={() => updateType(type)} disabled={savingId === type.id}>
                  <Save size={16} />
                  {savingId === type.id ? "..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
