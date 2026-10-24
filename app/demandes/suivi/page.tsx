"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, CheckCircle, Clock, CreditCard, Download, FileText, Plus, Loader2, MapPin, Search, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { PDFGenerator } from "@/services/pdf/pdfGenerator";

type RequestEvent = { id: string; action: string; actorName: string; note?: string | null; createdAt: string };
type RequestItem = {
  id: string;
  reference: string;
  type: string;
  subject: string;
  description: string;
  commune?: string | null;
  status: string;
  statusLabel: string;
  price: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentLabel?: string;
  withdrawalMethod: string;
  withdrawalLabel?: string;
  attachmentName?: string | null;
  signedDocumentName?: string | null;
  signedDocumentContent?: string | null;
  signedSignatureData?: string | null;
  downloadEnabled: boolean;
  createdAt: string;
  events: RequestEvent[];
};

const steps = ["PENDING", "IN_PROGRESS", "APPROVED", "COMPLETED"];
const stepLabels = ["Dépôt", "Traitement", "Validation", "Clôture"];
const wavePaymentUrl = "https://pay.wave.com/m/M_sn_WALm6CkqL2VK/c/sn/";
const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "IN_PROGRESS", label: "En traitement" },
  { value: "APPROVED", label: "Validée" },
  { value: "REJECTED", label: "Rejetée" },
  { value: "COMPLETED", label: "Terminée" },
];

function paymentHref(baseUrl: string, request: RequestItem) {
  if (baseUrl.includes("pay.wave.com")) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}reference=${encodeURIComponent(request.reference)}&amount=${request.price}`;
}
function formatDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat("fr-FR", withTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "long" }).format(new Date(value));
}

export default function SuiviDemandes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    fetch("/api/demandes", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Impossible de charger vos demandes.");
        return data;
      })
      .then((data) => { if (active) setRequests(Array.isArray(data.requests) ? data.requests : []); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Une erreur est survenue."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("fr");
    return requests.filter((request) => {
      const haystack = [request.reference, request.subject, request.type, request.commune || ""].join(" ").toLocaleLowerCase("fr");
      return (!query || haystack.includes(query)) && (statusFilter === "all" || request.status === statusFilter);
    });
  }, [requests, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((request) => request.status === "PENDING").length,
    inProgress: requests.filter((request) => request.status === "IN_PROGRESS").length,
    completed: requests.filter((request) => ["APPROVED", "COMPLETED"].includes(request.status)).length,
  }), [requests]);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/demandes" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-300"><ArrowLeft size={16} /> Mes demandes</Link>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700 dark:text-green-300">Espace citoyen</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Suivi de mes demandes</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Consultez le statut, les étapes de traitement, le paiement et les modalités de retrait de chaque dossier.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/demandes/historique" className="btn-secondary inline-flex items-center gap-2">Historique complet <ArrowRight size={16} /></Link>
          <Link href="/demandes/nouvelle" className="btn-primary inline-flex items-center gap-2"><Plus size={17} /> Nouvelle demande</Link>
        </div>
      </div>

      <section aria-label="Résumé de vos demandes" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total des dossiers" value={stats.total} icon={FileText} tone="slate" />
        <SummaryCard label="En attente" value={stats.pending} icon={Clock} tone="amber" />
        <SummaryCard label="En traitement" value={stats.inProgress} icon={ShieldCheck} tone="blue" />
        <SummaryCard label="Validées ou terminées" value={stats.completed} icon={CheckCircle} tone="green" />
      </section>

      <section className="card-modern p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><h2 className="text-lg font-semibold text-slate-950 dark:text-white">Vos dossiers</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filtered.length} résultat{filtered.length === 1 ? "" : "s"}</p></div>
          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_210px] md:w-[min(100%,560px)]">
            <label className="relative block"><span className="sr-only">Rechercher par référence, objet, type ou commune</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Référence, objet, démarche…" className="input-modern w-full pl-10" /></label>
            <label><span className="sr-only">Filtrer par statut</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-modern w-full">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="card-modern flex min-h-52 items-center justify-center gap-3 text-slate-500" role="status"><Loader2 size={20} className="animate-spin" /> Chargement de vos dossiers…</div>
      ) : error ? (
        <div className="card-modern flex items-start gap-3 border-rose-200 bg-rose-50 p-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200" role="alert"><AlertTriangle size={20} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Le suivi n’a pas pu être chargé.</p><p className="mt-1 text-sm">{error}</p><Link href="/auth/login" className="mt-3 inline-block font-semibold underline">Se connecter puis réessayer</Link></div></div>
      ) : filtered.length === 0 ? (
        <div className="card-modern px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"><FileText size={24} /></span>
          <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">{requests.length ? "Aucun dossier ne correspond" : "Aucune demande pour le moment"}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">{requests.length ? "Modifiez votre recherche ou le statut sélectionné." : "Après avoir déposé une demande, vous pourrez suivre ici son avancement et ses mises à jour."}</p>
          {!requests.length && <Link href="/demandes/nouvelle" className="btn-primary mt-5 inline-flex items-center gap-2"><Plus size={17} /> Déposer une demande</Link>}
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((request, index) => <RequestTracking key={request.id} request={request} index={index} reduceMotion={Boolean(reduceMotion)} />)}
        </div>
      )}

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
        <div className="flex gap-3"><Clock size={18} className="mt-0.5 shrink-0 text-amber-600" /><p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">En attente</strong><br />Votre demande a été reçue et attend son traitement.</p></div>
        <div className="flex gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-600" /><p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">En traitement</strong><br />Un agent examine votre dossier.</p></div>
        <div className="flex gap-3"><CheckCircle size={18} className="mt-0.5 shrink-0 text-green-600" /><p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Terminée</strong><br />Consultez les indications de retrait ou de téléchargement.</p></div>
      </section>
    </div>
  );
}

function RequestTracking({ request, index, reduceMotion }: { request: RequestItem; index: number; reduceMotion: boolean }) {
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [expanded, setExpanded] = useState(index === 0);
  const currentIndex = request.status === "REJECTED" ? 1 : Math.max(0, steps.indexOf(request.status));
  const paymentUrl = process.env.NEXT_PUBLIC_PAYMENT_URL || wavePaymentUrl;
  const canDownload = request.status === "COMPLETED" && request.paymentStatus === "PAID" && request.withdrawalMethod !== "COUNTER" && request.downloadEnabled && Boolean(request.signedDocumentContent);

  const downloadSignedDocument = async () => {
    if (!request.signedDocumentContent) return;
    setDownloadError("");
    setDownloading(true);
    try {
      await PDFGenerator.generateText(request.signedDocumentContent, request.signedDocumentName || `${request.reference}.pdf`, request.signedSignatureData || undefined);
    } catch {
      setDownloadError("Le téléchargement a échoué. Réessayez ou contactez la mairie avec votre référence.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.article initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.2) }} className="card-modern overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{request.reference}</span><StatusBadge status={request.status} label={request.statusLabel} /></div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{request.subject}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{request.type}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400"><span className="inline-flex items-center gap-1.5"><CalendarDays size={15} /> Déposée le {formatDate(request.createdAt)}</span>{request.commune && <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {request.commune}</span>}{request.attachmentName && <span className="inline-flex items-center gap-1.5"><FileText size={15} /> Pièce jointe : {request.attachmentName}</span>}</div>
          </div>
          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <div className="min-w-32 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900"><p className="text-xs text-slate-500 dark:text-slate-400">Montant</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{Number(request.price || 0).toLocaleString("fr-FR")} FCFA</p><p className={`mt-1 text-xs ${request.paymentStatus === "PAID" ? "text-green-700 dark:text-green-300" : request.price ? "text-amber-700 dark:text-amber-300" : "text-slate-500"}`}>{request.paymentStatus === "PAID" ? "Paiement confirmé" : request.price ? "Paiement à confirmer" : "Sans frais"}</p></div>
            {request.paymentMethod === "REMOTE" && request.paymentStatus !== "PAID" && request.price > 0 && <a href={paymentHref(paymentUrl, request)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"><CreditCard size={16} /> Payer à distance</a>}
            {canDownload && <button type="button" disabled={downloading} onClick={downloadSignedDocument} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"><Download size={16} />{downloading ? "Préparation…" : "Télécharger le document"}</button>}
            {request.withdrawalMethod === "COUNTER" && request.status === "COMPLETED" && <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"><MapPin size={16} /> Retrait au guichet</span>}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Avancement</h3><span className="text-xs text-slate-500">{request.statusLabel}</span></div>
          <div className="grid grid-cols-4 gap-2" aria-label={`Progression : ${request.statusLabel}`}>
            {stepLabels.map((label, stepIndex) => <div key={label}><div className={`h-2 rounded-full ${request.status === "REJECTED" && stepIndex > currentIndex ? "bg-slate-200 dark:bg-slate-700" : stepIndex <= currentIndex ? request.status === "REJECTED" ? "bg-rose-500" : "bg-green-500" : "bg-slate-200 dark:bg-slate-700"}`} /><p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">{label}</p></div>)}
          </div>
        </div>
        {downloadError && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200" role="alert">{downloadError}</p>}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800">
        <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900 sm:px-6"><span><span className="block text-sm font-semibold text-slate-900 dark:text-white">Historique de traitement</span><span className="mt-0.5 block text-xs text-slate-500">{request.events?.length || 0} mise(s) à jour</span></span><span className={`text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span></button>
        {expanded && <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div><h4 className="text-sm font-semibold text-slate-900 dark:text-white">Résumé du dossier</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{request.description || "Aucune description complémentaire."}</p><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white px-3 py-1.5 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">{request.paymentLabel || (request.paymentMethod === "COUNTER" ? "Paiement au guichet" : "Paiement à distance")}</span><span className="rounded-full bg-white px-3 py-1.5 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">{request.withdrawalLabel || (request.withdrawalMethod === "COUNTER" ? "Retrait au guichet" : "Téléchargement")}</span></div></div>
            <div><h4 className="text-sm font-semibold text-slate-900 dark:text-white">Dernières mises à jour</h4>{request.events?.length ? <ol className="mt-3 space-y-3">{[...request.events].reverse().map((event) => <li key={event.id} className="relative border-l-2 border-green-200 pb-2 pl-4 last:pb-0 dark:border-green-900"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-green-600" /><p className="text-sm font-medium text-slate-800 dark:text-slate-200">{event.action}</p><p className="mt-0.5 text-xs text-slate-500">{formatDate(event.createdAt, true)} · {event.actorName}</p>{event.note && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{event.note}</p>}</li>)}</ol> : <p className="mt-3 text-sm text-slate-500">La demande a été déposée. Les prochaines mises à jour apparaîtront ici.</p>}</div>
          </div>
        </div>}
      </div>
    </motion.article>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof FileText; tone: "slate" | "amber" | "blue" | "green" }) {
  const styles = { slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200", amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200", blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200", green: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-200" };
  return <div className="card-modern flex items-center justify-between p-5"><div><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p></div><span className={`rounded-2xl p-3 ${styles[tone]}`}><Icon size={21} /></span></div>;
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const style = status === "REJECTED" ? "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900" : status === "APPROVED" || status === "COMPLETED" ? "bg-green-50 text-green-800 ring-green-200 dark:bg-green-950/40 dark:text-green-200 dark:ring-green-900" : status === "IN_PROGRESS" ? "bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-900" : "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900";
  const Icon = status === "REJECTED" ? XCircle : status === "PENDING" ? Clock : status === "IN_PROGRESS" ? ShieldCheck : CheckCircle;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}><Icon size={14} />{label || status}</span>;
}
