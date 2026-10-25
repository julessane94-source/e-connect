"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { BarChart3, CalendarDays, Check, Clock3, LoaderCircle, Save, Users } from "lucide-react";

type Period = "DAILY" | "WEEKLY" | "MONTHLY";
type Agent = { id: string; name: string; email: string; department: string };
type Evaluation = { agentId: string; score: number; note: string };
type HistoryItem = {
  id: string;
  agentId: string;
  agentName: string;
  period: Period | string;
  periodStart: string;
  score: number;
  note: string;
  updatedAt: string;
};

const periodLabels: Record<Period, string> = { DAILY: "Journalier", WEEKLY: "Hebdomadaire", MONTHLY: "Mensuel" };

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default function SuiviAgentsPage() {
  const { data: session, status } = useSession();
  const [period, setPeriod] = useState<Period>("DAILY");
  const [date, setDate] = useState(today);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bucketDate, setBucketDate] = useState(today);
  const [drafts, setDrafts] = useState<Record<string, { score: string; note: string }>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const role = session?.user?.role;
  const canManage = role === "ADMIN" || role === "MANAGER";

  const loadData = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setMessage("");
    try {
      const query = new URLSearchParams({ period, date });
      const response = await fetch(`/api/agent-scores?${query.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Chargement impossible.");
      setAgents(payload.agents || []);
      setBucketDate(payload.periodStart || date);
      setHistory(payload.history || []);
      const nextDrafts: Record<string, { score: string; note: string }> = {};
      for (const agent of payload.agents || []) nextDrafts[agent.id] = { score: "", note: "" };
      for (const item of payload.scores || []) nextDrafts[item.agentId] = { score: String(item.score), note: item.note || "" };
      setDrafts(nextDrafts);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [canManage, date, period]);

  useEffect(() => { void loadData(); }, [loadData]);

  const ratedCount = useMemo(() => Object.values(drafts).filter((draft) => draft.score !== "").length, [drafts]);
  const average = useMemo(() => {
    const scores = Object.values(drafts).map((draft) => Number(draft.score)).filter((score) => Number.isFinite(score) && score >= 0 && score <= 100);
    return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  }, [drafts]);

  const saveScore = async (agentId: string) => {
    const draft = drafts[agentId];
    if (!draft || draft.score === "") {
      setMessage("Saisissez une note en pourcentage avant d'enregistrer.");
      return;
    }
    const score = Number(draft.score);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      setMessage("La note doit être un nombre entier compris entre 0 et 100.");
      return;
    }

    setSaving(agentId);
    setMessage("");
    try {
      const response = await fetch("/api/agent-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, period, date, score, note: draft.note }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Enregistrement impossible.");
      setMessage(`Note de ${payload.score.score} % enregistrée pour ${agents.find((agent) => agent.id === agentId)?.name || "l'agent"}.`);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setSaving(null);
    }
  };

  if (status === "loading") return <div className="card-modern p-8 text-sm text-slate-500">Chargement de votre espace…</div>;
  if (!canManage) return <div className="card-modern p-8"><h1 className="text-xl font-bold text-slate-900 dark:text-white">Accès réservé</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Le suivi des agents est accessible aux managers et à l’administration.</p></div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"><Users className="h-3.5 w-3.5" /> Pilotage de l’équipe</p>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Suivi des agents</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Attribuez et consultez les évaluations journalières, hebdomadaires ou mensuelles.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          <span className="text-slate-500">Moyenne affichée</span>
          <strong className="text-lg text-slate-950 dark:text-white">{average === null ? "—" : `${average} %`}</strong>
        </div>
      </header>

      <section className="card-modern flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Période d’évaluation</span>
            <select className="input-modern w-full" value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
              {Object.entries(periodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Date de référence</span>
            <span className="relative block"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="date" className="input-modern w-full pl-10" value={date} max={today()} onChange={(event) => setDate(event.target.value)} /></span>
            <span className="mt-1 block text-xs text-slate-500">Semaine calculée du lundi au dimanche ; mois regroupé par date de référence.</span>
          </label>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900"><span className="font-semibold text-slate-900 dark:text-white">{ratedCount}</span><span className="ml-1 text-slate-500">note(s) renseignée(s) sur {agents.length} agents</span></div>
      </section>

      {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</div>}

      <section className="card-modern overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div><h2 className="font-semibold text-slate-950 dark:text-white">Équipe à évaluer</h2><p className="text-sm text-slate-500">{periodLabels[period]} · {date}</p></div>
          {loading && <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" aria-label="Chargement" />}
        </div>
        {loading ? <div className="p-8 text-center text-sm text-slate-500">Chargement des agents…</div> : agents.length === 0 ? (
          <div className="p-8 text-center"><Users className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-medium text-slate-700 dark:text-slate-200">Aucun agent actif dans votre périmètre.</p><p className="mt-1 text-sm text-slate-500">Vérifiez l’affectation du service dans la gestion des utilisateurs.</p></div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {agents.map((agent) => {
              const draft = drafts[agent.id] || { score: "", note: "" };
              const saved = history.find((item) => item.agentId === agent.id && item.period === period && item.periodStart === bucketDate);
              return <article key={agent.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(180px,1fr)_150px_minmax(220px,1.5fr)_auto] lg:items-end">
                <div className="min-w-0"><h3 className="truncate font-semibold text-slate-900 dark:text-white">{agent.name}</h3><p className="truncate text-sm text-slate-500">{agent.email}</p><span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{agent.department}</span></div>
                <label><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Note (%)</span><span className="relative block"><input type="number" min="0" max="100" step="1" inputMode="numeric" aria-label={`Note de ${agent.name} en pourcentage`} value={draft.score} onChange={(event) => setDrafts((current) => ({ ...current, [agent.id]: { ...draft, score: event.target.value } }))} className="input-modern w-full pr-9" placeholder="0–100" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span></span></label>
                <label><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Remarque (facultative)</span><input maxLength={500} value={draft.note} onChange={(event) => setDrafts((current) => ({ ...current, [agent.id]: { ...draft, note: event.target.value } }))} className="input-modern w-full" placeholder="Résultats ou observations" /></label>
                <div className="flex items-center gap-3"><button type="button" onClick={() => void saveScore(agent.id)} disabled={saving !== null || draft.score === ""} className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">{saving === agent.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saving === agent.id ? "Enregistrement" : saved ? "Mettre à jour" : "Enregistrer"}</button></div>
              </article>;
            })}
          </div>
        )}
      </section>

      <section className="card-modern overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-950 dark:text-white">Évaluations récentes</h2><p className="text-sm text-slate-500">Historique des notes enregistrées dans votre périmètre.</p></div>
        {history.length === 0 ? <p className="p-6 text-sm text-slate-500">Aucune évaluation enregistrée pour le moment.</p> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{history.slice(0, 12).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><div><p className="font-medium text-slate-900 dark:text-white">{item.agentName}</p><p className="text-xs text-slate-500">{periodLabels[item.period as Period] || item.period} · {item.periodStart}{item.note ? ` · ${item.note}` : ""}</p></div><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-400" /><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">{item.score} %</span></div></div>)}</div>}
      </section>
    </div>
  );
}

