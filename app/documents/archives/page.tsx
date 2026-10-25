"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArchiveRestore, ChevronLeft, Download, FileText, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { PDFGenerator } from "@/services/pdf/pdfGenerator";

type DocumentItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  content?: string | null;
  requestId?: string | null;
  updatedAt: string;
  archivedAt?: string | null;
};

type RequestItem = {
  id: string;
  reference: string;
  subject: string;
  type: string;
  citizenName: string;
  commune?: string | null;
  statusLabel: string;
  archivedAt: string;
};

export default function Archives() {
  const { data: session } = useSession();
  const canManageRequests = ["ADMIN", "MANAGER"].includes(session?.user?.role || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const loadArchives = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams({ status: "ARCHIVED" });
      if (submittedSearch) params.set("q", submittedSearch);
      const [documentsResponse, requestsResponse] = await Promise.all([
        fetch(`/api/documents?${params.toString()}`, { cache: "no-store" }),
        canManageRequests ? fetch("/api/demandes?archived=true", { cache: "no-store" }) : Promise.resolve(null),
      ]);
      if (!documentsResponse.ok) throw new Error("Impossible de charger les documents archivés.");
      const documentsData = await documentsResponse.json();
      setDocuments(documentsData.documents ?? []);
      if (requestsResponse) {
        if (!requestsResponse.ok) throw new Error("Impossible de charger les demandes archivées.");
        const requestsData = await requestsResponse.json();
        setRequests(requestsData.requests ?? []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement des archives impossible.");
    } finally {
      setLoading(false);
    }
  }, [canManageRequests, submittedSearch]);

  useEffect(() => {
    void loadArchives();
  }, [loadArchives]);

  const filteredRequests = useMemo(() => {
    const query = submittedSearch.toLowerCase();
    return requests.filter((request) => `${request.reference} ${request.subject} ${request.citizenName} ${request.type} ${request.commune || ""}`.toLowerCase().includes(query));
  }, [requests, submittedSearch]);
  const archivedRequestIds = useMemo(() => new Set(requests.map((request) => request.id)), [requests]);

  const restore = async (kind: "document" | "request", id: string) => {
    setSavingId(`${kind}:${id}`);
    setMessage("");
    try {
      const response = kind === "document"
        ? await fetch(`/api/documents/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restore" }) })
        : await fetch(`/api/demandes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restore" }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Restauration impossible.");
      await loadArchives();
      setMessage(kind === "request" ? "Demande restaurée avec ses documents." : "Document restauré.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Restauration impossible.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Archives</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Retrouver et restaurer les demandes et documents archivés.</p>
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
          <button className="btn-primary" onClick={() => setSubmittedSearch(searchTerm.trim())}>Rechercher</button>
        </div>
      </div>

      {message && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">{message}</div>}

      {canManageRequests && <section className="card-modern p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Demandes archivées</h2>
        {loading ? <p className="p-4 text-center text-gray-500">Chargement...</p> : filteredRequests.length === 0 ? <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-700">Aucune demande archivée.</p> : <div className="space-y-3">
          {filteredRequests.map((request) => <div key={request.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold text-gray-900 dark:text-white">{request.reference} · {request.subject}</p><p className="text-sm text-gray-500">{request.citizenName} · {request.type}{request.commune ? ` · ${request.commune}` : ""}</p><p className="text-xs text-gray-500">{request.statusLabel} · archivée le {new Date(request.archivedAt).toLocaleDateString("fr-FR")}</p></div>
            <button disabled={savingId === `request:${request.id}`} aria-label={`Restaurer la demande ${request.reference}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50" onClick={() => void restore("request", request.id)}><ArchiveRestore size={16} />{savingId === `request:${request.id}` ? "Restauration..." : "Restaurer"}</button>
          </div>)}
        </div>}
      </section>}

      <div className="card-modern p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Documents archivés</h2>
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
                  <button aria-label={`Télécharger ${document.title}`} className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200" onClick={() => PDFGenerator.generateText(document.content || document.title, `${document.title}.pdf`)}>
                    <Download size={16} />
                  </button>
                  <button disabled={savingId === `document:${document.id}` || Boolean(document.requestId && archivedRequestIds.has(document.requestId))} title={document.requestId && archivedRequestIds.has(document.requestId) ? "Restaurez la demande correspondante dans la section ci-dessus." : "Restaurer le document"} aria-label={`Restaurer ${document.title}`} className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => void restore("document", document.id)}>
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

