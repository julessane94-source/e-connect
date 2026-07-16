"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  FileText,
  FolderCog,
  Inbox,
  Plus,
  Settings,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

type RequestItem = {
  id: string;
  reference: string;
  type: string;
  subject: string;
  citizenName: string;
  commune?: string | null;
  price: number;
  status: string;
  statusLabel: string;
  urgency: string;
  createdAt: string;
};

type RequestStats = {
  total: number;
  pending: number;
  inProgress: number;
  approved: number;
  rejected: number;
  completed: number;
};

const statusTone: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900",
  COMPLETED: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:ring-teal-900",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900",
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const role = session?.user?.role || null;
  const isAdmin = role === "ADMIN";
  const isStaff = Boolean(role);

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadRequests = async () => {
      const response = await fetch("/api/demandes", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setRequests(data.requests ?? []);
      setStats(data.stats ?? stats);
    };

    loadRequests();
  }, [status]);

  const recentRequests = useMemo(() => requests.slice(0, 6), [requests]);
  const communeSummaries = useMemo(() => {
    const summaries = new Map<string, { commune: string; total: number; active: number; completed: number }>();
    for (const request of requests) {
      const commune = request.commune || "Non renseignée";
      const current = summaries.get(commune) || { commune, total: 0, active: 0, completed: 0 };
      current.total += 1;
      if (["PENDING", "IN_PROGRESS"].includes(request.status)) current.active += 1;
      if (["APPROVED", "COMPLETED"].includes(request.status)) current.completed += 1;
      summaries.set(commune, current);
    }
    return Array.from(summaries.values())
      .sort((first, second) => second.active - first.active || second.total - first.total)
      .slice(0, 6);
  }, [requests]);
  const completed = stats.approved + stats.completed;
  const active = stats.pending + stats.inProgress;
  const completionRate = stats.total ? Math.round((completed / stats.total) * 100) : 0;
  const displayName = session?.user?.name || "Utilisateur";

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card-modern p-8 text-sm text-gray-500">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        name={displayName}
        role={role}
        isStaff={isStaff}
        isAdmin={isAdmin}
        commune={session?.user?.commune || null}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Inbox} label={isStaff && !isAdmin ? "Dossiers visibles" : "Total demandes"} value={stats.total} tone="slate" />
        <StatCard icon={Clock} label="En attente" value={stats.pending} tone="amber" />
        <StatCard icon={UserCheck} label="En traitement" value={stats.inProgress} tone="blue" />
        <StatCard icon={CheckCircle} label="Terminées" value={completed} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <div className="space-y-6">
          <RoleOverview role={role} stats={stats} commune={session?.user?.commune || null} nic={session?.user?.nic || null} />
          {isAdmin && <CommuneOverview summaries={communeSummaries} />}
          <RecentPanel requests={recentRequests} staff={isStaff} />
        </div>

        <div className="space-y-6">
          <HealthPanel active={active} completed={completed} rejected={stats.rejected} completionRate={completionRate} />
          {isAdmin ? (
            <AdminActions stats={stats} />
          ) : isStaff ? (
            <AgentActions stats={stats} />
          ) : (
            <CitizenActions stats={stats} />
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardHeader({
  name,
  role,
  isStaff,
  isAdmin,
  commune,
}: {
  name: string;
  role: string | null;
  isStaff: boolean;
  isAdmin: boolean;
  commune?: string | null;
}) {
  const title = isAdmin ? "Centre de coordination" : isStaff ? `Espace ${commune ? `communal de ${commune}` : "agent"}` : "Espace citoyen";
  const subtitle = isAdmin
    ? "Suivez la file globale, les transferts communaux et les paramètres opérationnels."
    : isStaff
      ? "Traitez les dossiers de votre commune, transférez les erreurs d'orientation et notifiez les citoyens."
      : "Déposez vos demandes, suivez leur traitement et récupérez vos documents signés.";

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-sm dark:border-slate-800">
      <div className="grid gap-0 lg:grid-cols-[1.55fr_0.9fr]">
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">{role || "CITOYEN"}</span>
            {commune && <span className="rounded-full bg-green-400/15 px-3 py-1 text-green-100 ring-1 ring-green-300/20">{commune}</span>}
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</p>
          <p className="mt-5 text-sm text-slate-400">Connecté : <span className="font-semibold text-white">{name}</span></p>
        </div>
        <div className="border-t border-white/10 bg-white/[0.03] p-6 sm:p-7 lg:border-l lg:border-t-0">
          <div className="grid gap-3">
            {!isStaff && (
              <PrimaryLink href="/demandes/nouvelle" icon={Plus} label="Nouvelle demande" />
            )}
            {isAdmin ? (
              <PrimaryLink href="/parametres" icon={Settings} label="Administration" />
            ) : isStaff ? (
              <PrimaryLink href="/demandes" icon={FileText} label="Ouvrir la file" />
            ) : (
              <SecondaryLink href="/demandes/suivi" icon={UserCheck} label="Suivre mes dossiers" />
            )}
            <SecondaryLink href="/notifications" icon={Inbox} label="Notifications" />
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleOverview({ role, stats, commune, nic }: { role: string | null; stats: RequestStats; commune?: string | null; nic?: string | null }) {
  const completed = stats.approved + stats.completed;
  const completionRate = stats.total ? Math.round((completed / stats.total) * 100) : 0;
  const title = role === "ADMIN"
    ? "Vue régionale"
    : role
      ? "File communale"
      : "Identité citoyenne";
  const text = role === "ADMIN"
    ? "La coordination conserve une vue complète sur les communes, les assignations et les dossiers en attente."
    : role
      ? `Les demandes de ${commune || "votre commune"} sont visibles ici, avec transfert possible vers une autre mairie.`
      : `Votre profil est rattaché à ${commune || "votre commune"}. Vous pouvez suivre chaque étape depuis cet espace.`;

  return (
    <section className="card-modern overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-950/40 dark:text-green-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-950 dark:text-white">{title}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{text}</p>
            </div>
          </div>
          {!role && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoPill label="NIC" value={nic || "À générer"} />
              <InfoPill label="Commune" value={commune || "Non renseignée"} />
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50 lg:border-l lg:border-t-0">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Taux de clôture</p>
              <p className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">{completionRate}%</p>
            </div>
            <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completionRate}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Attente" value={stats.pending} />
            <MiniStat label="Actifs" value={stats.inProgress} />
            <MiniStat label="Finis" value={completed} />
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentPanel({ requests, staff }: { requests: RequestItem[]; staff: boolean }) {
  return (
    <section className="card-modern p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-950 dark:text-white">Dossiers récents</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Les derniers mouvements à traiter ou surveiller.</p>
        </div>
        <Link href="/demandes" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-300">
          Ouvrir
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <RequestList requests={requests} staff={staff} />
    </section>
  );
}

function HealthPanel({ active, completed, rejected, completionRate }: { active: number; completed: number; rejected: number; completionRate: number }) {
  return (
    <section className="card-modern p-6">
      <h2 className="text-lg font-semibold text-gray-950 dark:text-white">État opérationnel</h2>
      <div className="mt-5 space-y-4">
        <MetricRow label="Charge active" value={active} color="bg-blue-500" />
        <MetricRow label="Dossiers terminés" value={completed} color="bg-emerald-500" />
        <MetricRow label="Dossiers rejetés" value={rejected} color="bg-rose-500" />
      </div>
      <div className="mt-5 rounded-lg bg-slate-950 p-4 text-white">
        <p className="text-sm text-slate-300">Progression globale</p>
        <p className="mt-1 text-2xl font-bold">{completionRate}%</p>
      </div>
    </section>
  );
}

function CommuneOverview({ summaries }: { summaries: Array<{ commune: string; total: number; active: number; completed: number }> }) {
  return (
    <section className="card-modern p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-950 dark:text-white">Coordination communale</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Répartition des dossiers par mairie destinataire.</p>
        </div>
        <Link href="/parametres/utilisateurs" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-300">
          Comptes
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {summaries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          Aucun dossier communal pour le moment.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {summaries.map((item) => (
            <div key={item.commune} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-950 dark:text-white">{item.commune}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.total} dossier(s)</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900">
                  {item.active} actif(s)
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${item.total ? Math.round((item.completed / item.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminActions({ stats }: { stats: RequestStats }) {
  return (
    <ActionPanel title="Actions coordination">
      <ActionCard href="/demandes" icon={ShieldCheck} title="Assignations" text={`${stats.pending + stats.inProgress} dossier(s) à suivre`} />
      <ActionCard href="/demandes" icon={Building2} title="Transferts communaux" text="Réorienter un dossier vers la mairie compétente" />
      <ActionCard href="/parametres/utilisateurs" icon={Users} title="Utilisateurs" text="Créer agents, managers et comptes communaux" />
      <ActionCard href="/parametres/demandes" icon={FolderCog} title="Demandes et tarifs" text="Configurer les services et leurs coûts" />
      <ActionCard href="/reporting" icon={BarChart3} title="Indicateurs" text="Analyser l'activité de la plateforme" />
    </ActionPanel>
  );
}

function AgentActions({ stats }: { stats: RequestStats }) {
  return (
    <ActionPanel title="Actions agent">
      <ActionCard href="/demandes" icon={UserCheck} title="Traitement" text={`${stats.pending + stats.inProgress} dossier(s) dans votre file`} />
      <ActionCard href="/documents/generation" icon={FileText} title="Générer un document" text="Préparer une pièce officielle" />
      <ActionCard href="/documents" icon={FolderCog} title="Documents actifs" text="Modifier, télécharger et classer" />
      <ActionCard href="/documents/archives" icon={Archive} title="Archives" text="Retrouver les dossiers classés" />
    </ActionPanel>
  );
}

function CitizenActions({ stats }: { stats: RequestStats }) {
  return (
    <ActionPanel title="Actions citoyen">
      <ActionCard href="/demandes/nouvelle" icon={Plus} title="Déposer une demande" text="Créer une nouvelle demande municipale" />
      <ActionCard href="/profil" icon={UserRound} title="Mon profil" text="Mettre à jour commune, registre et téléphone" />
      <ActionCard href="/demandes/suivi" icon={FileText} title="Suivre mes dossiers" text={`${stats.total} demande(s) dans votre espace`} />
      <ActionCard href="/auth/logout" icon={XCircle} title="Déconnexion" text="Fermer votre session" />
    </ActionPanel>
  );
}

function RequestList({ requests, staff = false }: { requests: RequestItem[]; staff?: boolean }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
        Aucune demande pour le moment.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {requests.map((request, index) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-gray-950 dark:text-white">{request.reference}</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusTone[request.status] ?? statusTone.PENDING}`}>
                {request.statusLabel}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-gray-700 dark:text-gray-200">{request.subject}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {staff ? `${request.citizenName}${request.commune ? ` - ${request.commune}` : ""} - ` : ""}
              {request.type} - {new Date(request.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{request.price.toLocaleString("fr-FR")} FCFA</p>
        </motion.div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: "slate" | "amber" | "blue" | "emerald" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };

  return (
    <section className="card-modern p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}

function ActionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-modern p-6">
      <h2 className="text-lg font-semibold text-gray-950 dark:text-white">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function ActionCard({ href, icon: Icon, title, text }: { href: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <Link href={href} className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-green-300 hover:bg-green-50/50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-green-800 dark:hover:bg-green-950/20">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-gray-100 p-2.5 text-gray-700 transition group-hover:bg-green-100 group-hover:text-green-700 dark:bg-gray-900 dark:text-gray-300 dark:group-hover:bg-green-950 dark:group-hover:text-green-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-950 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">{text}</p>
        </div>
      </div>
    </Link>
  );
}

function PrimaryLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-green-50">
      <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" />{label}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function SecondaryLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between gap-3 rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
      <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" />{label}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white p-3 dark:bg-gray-950">
      <p className="font-semibold text-gray-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <span className="font-semibold text-gray-950 dark:text-white">{value}</span>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-950 dark:text-white">{value}</p>
    </div>
  );
}
