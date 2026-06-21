"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Archive, Download, Edit, FileText, FolderOpen, Plus, Search, Upload } from "lucide-react";
import { PDFGenerator } from "@/services/pdf/pdfGenerator";

type DocumentItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  content?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  active: number;
  archived: number;
  recent: number;
};

export default function Documents() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, archived: 0, recent: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: "ACTIVE" });
    if (searchTerm) params.set("q", searchTerm);
    if (category !== "all") params.set("category", category);
    const response = await fetch(`/api/documents?${params.toString()}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setDocuments(data.documents ?? []);
      setStats(data.stats ?? stats);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const categories = useMemo(() => ["all", ...Array.from(new Set(documents.map((document) => document.category)))], [documents]);

  const importFile = async (file: File) => {
    const text = file.type.startsWith("text/") || file.name.endsWith(".csv") ? await file.text() : `Fichier importé : ${file.name}`;
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: file.name.replace(/\.[^.]+$/, ""),
        type: file.type || "Fichier",
        category: "Importé",
        content: text,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      }),
    });
    if (response.ok) await loadDocuments();
  };

  const saveEdit = async () => {
    if (!editing) return;
    const response = await fetch(`/api/documents/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (response.ok) {
      setEditing(null);
      await loadDocuments();
    }
  };

  const archiveDocument = async (id: string) => {
    const response = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    if (response.ok) await loadDocuments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Importation, génération, recherche, modification et archivage persistants.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) importFile(file);
              event.currentTarget.value = "";
            }}
          />
          <button className="btn-primary flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} />
            Importer
          </button>
          <Link href="/documents/generation" className="btn-secondary flex items-center gap-2">
            <Plus size={18} />
            Générer
          </Link>
          <Link href="/documents/archives" className="btn-secondary flex items-center gap-2">
            <Archive size={18} />
            Archives
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total" value={stats.total} icon={FileText} />
        <Stat label="Actifs" value={stats.active} icon={FolderOpen} />
        <Stat label="Archivés" value={stats.archived} icon={Archive} />
        <Stat label="Récents" value={stats.recent} icon={FileText} />
      </div>

      <div className="card-modern p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par titre, contenu, catégorie, fichier..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="input-modern w-full md:w-48">
            {categories.map((item) => (
              <option key={item} value={item}>{item === "all" ? "Toutes catégories" : item}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={loadDocuments}>Rechercher</button>
        </div>
      </div>

      <div className="card-modern p-6">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Chargement...</p>
        ) : documents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
            Aucun document trouvé.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document, index) => (
                  <motion.tr
                    key={document.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{document.title}</p>
                      <p className="text-xs text-gray-500">{document.fileName || document.type}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{document.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(document.updatedAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200" onClick={() => setEditing(document)} title="Modifier">
                          <Edit size={16} />
                        </button>
                        <button className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200" onClick={() => PDFGenerator.generateText(document.content || document.title, `${document.title}.pdf`)} title="Télécharger">
                          <Download size={16} />
                        </button>
                        <button className="rounded-lg bg-amber-100 p-2 text-amber-700 hover:bg-amber-200" onClick={() => archiveDocument(document.id)} title="Archiver">
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Modifier le document</h2>
            <div className="mt-4 space-y-4">
              <input className="input-modern w-full" value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} />
              <input className="input-modern w-full" value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} />
              <textarea className="input-modern w-full" rows={8} value={editing.content || ""} onChange={(event) => setEditing({ ...editing, content: event.target.value })} />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn-primary" onClick={saveEdit}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
  return (
    <div className="card-modern p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
          <Icon className="h-5 w-5 text-green-700 dark:text-green-300" />
        </div>
      </div>
    </div>
  );
}
