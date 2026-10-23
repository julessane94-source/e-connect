"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";

type HistoryEvent = {
  id: string;
  action: string;
  actorName?: string | null;
  note?: string | null;
  createdAt: string;
};

type HistoryRequest = {
  id: string;
  reference: string;
  type: string;
  subject: string;
  description: string;
  citizenName: string;
  commune: string;
  citizenCommune?: string | null;
  status: string;
  statusLabel?: string;
  createdAt: string;
  assignedTo?: { firstName: string; lastName: string } | null;
  paymentLabel?: string;
  withdrawalLabel?: string;
  events?: HistoryEvent[];
};

const statusFilters = [
  { value: "all", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "IN_PROGRESS", label: "En traitement" },
  { value: "APPROVED", label: "Validées" },
  { value: "COMPLETED", label: "Terminées" },
  { value: "REJECTED", label: "Rejetées" },
];

export default function HistoriqueDemandes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState<HistoryRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadRequests = async () => {
      try {
        const response = await fetch("/api/demandes", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.message || "Impossible de charger l'historique.");
        }
        if (active) {
          setRequests(Array.isArray(payload.requests) ? payload.requests : []);
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Impossible de charger l'historique.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRequests();
    return () => {
      active = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("fr");
    return requests.filter((request) => {
      const matchesStatus = filter === "all" || request.status === filter;
      const searchable = [
        request.reference,
        request.subject,
        request.type,
        request.citizenName,
        request.commune,
      ].join(" ").toLocaleLowerCase("fr");
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [filter, requests, searchTerm]);

  const selectedRequest = requests.find((request) => request.id === selectedId) ?? null;

  const exportCsv = () => {
    if (filteredRequests.length === 0) return;

    const csvValue = (value: unknown) => {
      const text = String(value ?? "");
      const safe = /^[=+@-]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const rows = [
      ["Référence", "Objet", "Type", "Citoyen", "Commune", "Date", "Statut", "Agent"],
      ...filteredRequests.map((request) => [
        request.reference,
        request.subject,
        request.type,
        request.citizenName,
        request.commune,
        formatDate(request.createdAt),
        request.statusLabel || request.status,
        request.assignedTo ? `${request.assignedTo.firstName} ${request.assignedTo.lastName}` : "",
      ]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(csvValue).join(";")).join("\r\n");
    const url = window.URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "historique-demandes.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" aria-label="Retour aux demandes" className="rounded-xl p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">Suivi administratif</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Historique des demandes</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Retrouvez les demandes auxquelles votre compte a accès.</p>
        </div>
      </div>

      <section aria-label="Filtres de l'historique" className="card-modern p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px_auto] md:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Rechercher</span>
            <span className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Référence, objet, citoyen ou commune"
                className="input-modern w-full pl-10"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</span>
            <span className="relative block">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="input-modern w-full pl-10">
                {statusFilters.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </span>
          </label>

          <button type="button" onClick={exportCsv} disabled={filteredRequests.length === 0} className="btn-secondary inline-flex items-center justify-center gap-2">
            <Download size={17} />
            Exporter en CSV
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
          {loading ? "Chargement des demandes…" : `${filteredRequests.length} demande(s) affichée(s)`}
        </p>
      </section>

      {error && (
        <div role="alert" aria-live="polite" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Historique indisponible</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      <section className="card-modern overflow-hidden" aria-label="Liste des demandes">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-gray-500" role="status">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            Chargement de l'historique…
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {requests.length === 0 ? "Aucune demande pour le moment" : "Aucun résultat"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {requests.length === 0
                ? "Les demandes envoyées depuis votre espace apparaîtront ici."
                : "Essayez un autre mot-clé ou un autre statut."}
            </p>
            {requests.length === 0 && (
              <Link href="/demandes/nouvelle" className="btn-primary mt-5 inline-flex items-center gap-2">
                Déposer une demande
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <caption className="sr-only">Demandes accessibles à votre compte</caption>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-800 dark:bg-gray-900/60">
                  {["Référence", "Demande", "Citoyen / commune", "Date", "Statut", "Détail"].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.025, 0.2) }}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {request.reference}
                      <span className="mt-1 block text-xs font-normal text-gray-400">{request.type}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className="block max-w-xs truncate font-medium" title={request.subject}>{request.subject}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {request.citizenName}
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{request.commune}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(request.createdAt)}</td>
                    <td className="px-4 py-4"><StatusBadge status={request.status} label={request.statusLabel} /></td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        aria-label={`Voir les détails de ${request.reference}`}
                        aria-expanded={selectedId === request.id}
                        onClick={() => setSelectedId((current) => current === request.id ? null : request.id)}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-50 focus-visible:ring-2 focus-visible:ring-green-600 dark:text-green-300 dark:hover:bg-green-950/40"
                      >
                        <Eye size={16} />
                        Détails
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRequest && (
        <section id="historique-request-detail" aria-labelledby="historique-request-title" className="card-modern space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">Détail de la demande</p>
              <h2 id="historique-request-title" className="mt-1 text-xl font-bold text-gray-950 dark:text-white">
                {selectedRequest.reference} · {selectedRequest.subject}
              </h2>
            </div>
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Fermer les détails" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Detail icon={FileText} label="Service" value={selectedRequest.type} />
            <Detail icon={UserRound} label="Citoyen" value={selectedRequest.citizenName} />
            <Detail icon={CalendarDays} label="Déposée le" value={formatDate(selectedRequest.createdAt)} />
            <Detail icon={UserRound} label="Agent assigné" value={selectedRequest.assignedTo ? `${selectedRequest.assignedTo.firstName} ${selectedRequest.assignedTo.lastName}` : "Non assigné"} />
          </div>
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">{selectedRequest.description}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{selectedRequest.commune}</span>
            {selectedRequest.paymentLabel && <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">{selectedRequest.paymentLabel}</span>}
            {selectedRequest.withdrawalLabel && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{selectedRequest.withdrawalLabel}</span>}
          </div>
          {selectedRequest.events && selectedRequest.events.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Clock3 className="h-4 w-4 text-green-700 dark:text-green-300" />
                Historique de traitement
              </h3>
              <ol className="space-y-3 border-l border-gray-200 pl-4 dark:border-gray-800">
                {selectedRequest.events.map((event) => (
                  <li key={event.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-white dark:ring-gray-950" />
                    <p className="font-medium text-gray-800 dark:text-gray-200">{event.action}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(event.createdAt)}{event.actorName ? ` · ${event.actorName}` : ""}
                    </p>
                    {event.note && <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{event.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label?: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200",
  };
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
      {label || status}
    </span>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <Icon className="h-4 w-4 text-green-700 dark:text-green-300" />
      <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date inconnue" : date.toLocaleDateString("fr-FR", { dateStyle: "medium" });
}
