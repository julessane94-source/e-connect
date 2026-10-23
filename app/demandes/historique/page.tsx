"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownToLine, CalendarDays, CheckCircle2, ChevronDown, AlertTriangle,
  Clock3, FilePlus2, FileText, Loader2, MapPin, Search, ShieldCheck,
} from "lucide-react";

type RequestEvent = {
  id: string;
  action: string;
  actorName: string;
  note?: string | null;
  createdAt: string;
};

type RequestItem = {
  id: string;
  reference: string;
  type: string;
  subject: string;
  description: string;
  citizenName: string;
  commune?: string | null;
  citizenCommune?: string | null;
  price: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentLabel?: string;
  withdrawalLabel?: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  processedAt?: string | null;
  assignedTo?: { firstName: string; lastName: string; email: string } | null;
  events: RequestEvent[];
};

type RequestStats = {
  total: number;
  pending: number;
  inProgress: number;
  approved: number;
  rejected: number;
  completed: number;
};

const initialStats: RequestStats = { total: 0, pending: 0, inProgress: 0, approved: 0, rejected: 0, completed: 0 };

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
  IN_PROGRESS: "bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-900",
  APPROVED: "bg-green-50 text-green-800 ring-green-200 dark:bg-green-950/40 dark:text-green-200 dark:ring-green-900",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900",
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900",
};

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (["=", "+", "-", "@", "\t", "\r"].includes(text.charAt(0))) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export default function HistoriqueDemandes() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState(initialStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/demandes", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Impossible de charger les demandes.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        setRequests(Array.isArray(data.requests) ? data.requests : []);
        setStats({ ...initialStats, ...(data.stats || {}) });
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("fr");
    return requests.filter((item) => {
      const text = [item.reference, item.subject, item.type, item.commune, item.statusLabel].join(" ").toLocaleLowerCase("fr");
      return (!query || text.includes(query)) && (statusFilter === "all" || item.status === statusFilter);
    });
  }, [requests, searchTerm, statusFilter]);

  const exportCsv = () => {
    const rows = [
      ["Référence", "Objet", "Type", "Commune", "Date de dépôt", "Statut", "Paiement", "Montant (FCFA)"],
      ...filtered.map((item) => [
        item.reference, item.subject, item.type, item.commune || "", formatDate(item.createdAt),
        item.statusLabel, item.paymentStatus === "PAID" ? "Payé" : "En attente", item.price,
      ]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "historique-des-demandes.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { label: "Total des demandes", value: stats.total, icon: FileText, tone: "text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-800" },
    { label: "En attente", value: stats.pending, icon: Clock3, tone: "text-amber-700 bg-amber-100 dark:text-amber-200 dark:bg-amber-950/50" },
    { label: "En traitement", value: stats.inProgress, icon: ShieldCheck, tone: "text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-950/50" },
    { label: "Terminées", value: stats.approved + stats.completed, icon: CheckCircle2, tone: "text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-950/50" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/demandes" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-300">
            <span aria-hidden="true">←</span> Retour aux demandes
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700 dark:text-green-300">Espace citoyen</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Historique de mes demandes</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Retrouvez vos démarches, leur avancement, les dernières mises à jour et les informations de paiement.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={exportCsv} disabled={!filtered.length} className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            <ArrowDownToLine size={17} /> Exporter la liste
          </button>
          <Link href="/demandes/nouvelle" className="btn-primary inline-flex items-center gap-2">
            <FilePlus2 size={17} /> Nouvelle demande
          </Link>
        </div>
      </div>

      <section aria-label="Résumé des demandes" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }, index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card-modern flex items-center justify-between p-5">
            <div><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p></div>
            <span className={`rounded-2xl p-3 ${tone}`}><Icon size={21} /></span>
          </motion.div>
        ))}
      </section>

      <section className="card-modern overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-lg font-semibold text-slate-950 dark:text-white">Toutes mes démarches</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p></div>
            <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_210px]">
              <label className="relative block">
                <span className="sr-only">Rechercher par référence, objet, type ou commune</span>
                <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Rechercher une demande…" className="input-modern w-full pl-10" />
              </label>
              <label>
                <span className="sr-only">Filtrer par statut</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-modern w-full">
                  <option value="all">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="IN_PROGRESS">En traitement</option>
                  <option value="APPROVED">Validée</option>
                  <option value="REJECTED">Rejetée</option>
                  <option value="COMPLETED">Terminée</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-3 text-slate-500" role="status"><Loader2 className="animate-spin" size={20} /> Chargement de votre historique…</div>
        ) : error ? (
          <div className="m-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200" role="alert"><AlertTriangle size={19} className="mt-0.5 shrink-0" /><p>{error} <Link href="/auth/login" className="font-semibold underline">Connectez-vous</Link> puis réessayez.</p></div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"><FileText size={25} /></span>
            <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{requests.length ? "Aucun résultat pour ces filtres" : "Votre historique est encore vide"}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{requests.length ? "Essayez une autre recherche ou sélectionnez un autre statut." : "Vos démarches apparaîtront ici après leur dépôt. Vous pourrez ensuite consulter leur suivi depuis cette page."}</p>
            {!requests.length && <Link href="/demandes/nouvelle" className="btn-primary mt-5 inline-flex items-center gap-2"><FilePlus2 size={17} /> Déposer une demande</Link>}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((item, index) => {
              const isExpanded = expandedId === item.id;
              return (
                <motion.article key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.2) }} className="px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{item.reference}</span>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[item.status] || statusStyles.PENDING}`}>{item.statusLabel || item.status}</span>
                      </div>
                      <h3 className="mt-2 truncate text-base font-semibold text-slate-950 dark:text-white">{item.subject}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>{item.type}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(item.createdAt)}</span>
                        {item.commune && <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {item.commune}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 lg:justify-end">
                      <div className="text-left lg:text-right"><p className="text-xs text-slate-500 dark:text-slate-400">Montant</p><p className="font-semibold text-slate-900 dark:text-white">{Number(item.price || 0).toLocaleString("fr-FR")} FCFA</p><p className={`text-xs ${item.paymentStatus === "PAID" ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`}>{item.paymentStatus === "PAID" ? "Paiement confirmé" : item.price ? "Paiement à confirmer" : "Sans frais"}</p></div>
                      <button type="button" aria-expanded={isExpanded} onClick={() => setExpandedId(isExpanded ? null : item.id)} className="btn-secondary inline-flex items-center gap-2 whitespace-nowrap"><span>{isExpanded ? "Masquer" : "Détails"}</span><ChevronDown size={16} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} /></button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-5 grid gap-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70 md:grid-cols-[0.9fr_1.1fr] sm:p-5">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Informations de la demande</h4>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description || "Aucune description complémentaire."}</p>
                        <dl className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Mode de paiement</dt><dd className="text-right font-medium text-slate-800 dark:text-slate-200">{item.paymentLabel || (item.paymentMethod === "COUNTER" ? "Au guichet" : "À distance")}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Mode de retrait</dt><dd className="text-right font-medium text-slate-800 dark:text-slate-200">{item.withdrawalLabel || "Selon les modalités du service"}</dd></div>
                          {item.assignedTo && <div className="flex justify-between gap-3"><dt className="text-slate-500">Agent en charge</dt><dd className="text-right font-medium text-slate-800 dark:text-slate-200">{item.assignedTo.firstName} {item.assignedTo.lastName}</dd></div>}
                        </dl>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Étapes de traitement</h4>
                        {item.events?.length ? <ol className="mt-3 space-y-3">{[...item.events].reverse().map((event) => <li key={event.id} className="relative border-l-2 border-green-200 pb-2 pl-4 last:pb-0 dark:border-green-900"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-green-600" /><p className="text-sm font-medium text-slate-800 dark:text-slate-200">{event.action}</p><p className="mt-0.5 text-xs text-slate-500">{formatDate(event.createdAt)} · {event.actorName}</p>{event.note && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{event.note}</p>}</li>)}</ol> : <p className="mt-3 text-sm text-slate-500">Aucune mise à jour supplémentaire pour le moment.</p>}
                      </div>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
      <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">Les informations affichées correspondent aux données disponibles dans votre espace. Pour une question sur un dossier, utilisez la référence indiquée ci-dessus.</p>
    </div>
  );
}
