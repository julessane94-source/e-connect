"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArchiveRestore, ChevronLeft, Download, FileText, Search } from "lucide-react";
import { PDFGenerator } from "@/services/pdf/pdfGenerator";

type DocumentItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  content?: string | null;
  updatedAt: string;
  archivedAt?: string | null;
};

export default function Archives() {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArchives = async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: "ARCHIVED" });
    if (searchTerm) params.set("q", searchTerm);
    const response = await fetch(`/api/documents?${params.toString()}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setDocuments(data.documents ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadArchives();
  }, []);

  const restore = async (id: string) => {
    const response = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    if (response.ok) await loadArchives();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Archives</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Retrouver les documents archivés même plusieurs jours après traitement.</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher dans les archives..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <button className="btn-primary" onClick={loadArchives}>Rechercher</button>
        </div>
      </div>

      <div className="card-modern p-6">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Chargement...</p>
        ) : documents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
            Aucun document archivé.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{document.title}</p>
                    <p className="text-sm text-gray-500">
                      {document.category} - archivé le {new Date(document.archivedAt || document.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 md:justify-end">
                  <button className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200" onClick={() => PDFGenerator.generateText(document.content || document.title, `${document.title}.pdf`)}>
                    <Download size={16} />
                  </button>
                  <button className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200" onClick={() => restore(document.id)}>
                    <ArchiveRestore size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
