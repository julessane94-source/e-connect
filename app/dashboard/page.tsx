"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BarChart3,
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

  const recentRequests = useMemo(() => requests.slice(0, 5), [requests]);

  if (status === "loading") {
    return <div className="card-modern p-8">Chargement du tableau de bord...</div>;
  }

  const displayName = session?.user?.name || "Utilisateur";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bonjour, {displayName}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isAdmin
              ? "Pilotage global : utilisateurs, prix, assignations et indicateurs."
              : isStaff
                ? "Espace agent : demandes assignées, génération, signature et archivage."
                : "Votre espace citoyen personnel : demandes, traitement et suivi."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!isStaff && (
            <Link href="/demandes/nouvelle" className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Nouvelle demande
            </Link>
          )}
          {isAdmin ? (
            <Link href="/parametres" className="btn-primary flex items-center gap-2">
              <Settings size={18} />
              Administration
            </Link>
          ) : isStaff ? (
            <Link href="/documents/generation" className="btn-primary flex items-center gap-2">
              <FileText size={18} />
              Générer un document
            </Link>
          ) : null}
        </div>
      </div>

      <RoleOverview role={role} stats={stats} commune={session?.user?.commune || null} nic={session?.user?.nic || null} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label={isStaff && !isAdmin ? "Assignées" : "Total demandes"} value={stats.total} />
        <StatCard icon={Clock} label="En attente" value={stats.pending} />
        <StatCard icon={UserCheck} label="En traitement" value={stats.inProgress} />
        <StatCard icon={CheckCircle} label="Terminées" value={stats.approved + stats.completed} />
      </div>

      {isAdmin ? (
        <AdminDashboard requests={recentRequests} stats={stats} />
      ) : isStaff ? (
        <AgentDashboard requests={recentRequests} stats={stats} />
      ) : (
        <CitizenDashboard requests={recentRequests} stats={stats} />
      )}
    </div>
  );
}

function RoleOverview({ role, stats, commune, nic }: { role: string | null; stats: RequestStats; commune?: string | null; nic?: string | null }) {
  const completed = stats.approved + stats.completed;
  const completionRate = stats.total ? Math.round((completed / stats.total) * 100) : 0;
  const title = role === "ADMIN"
    ? "Centre de pilotage administratif"
    : role
      ? "Atelier de traitement agent"
      : "Espace citoyen";
  const text = role === "ADMIN"
    ? "Surveillez la file globale, assignez les dossiers et gardez les paramètres communaux à jour."
    : role
      ? "Votre tableau de bord affiche uniquement les demandes assignées et les actions nécessaires au traitement."
      : `Votre compte est rattaché à ${commune || "votre commune"}. Vos demandes restent limitées à cette commune.`;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
        <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 p-6 text-white">
          <p className="text-sm font-medium text-emerald-100">{role || "CITOYEN"}</p>
          <h2 className="mt-2 text-2xl font-bold">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50">{text}</p>
          {!role && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1">NIC : {nic || "à générer"}</span>
              <span className="rounded-full bg-white/15 px-3 py-1">Commune : {commune || "non renseignée"}</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Progression</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
            </div>
            <div className="rounded-2xl bg-green-100 p-4 dark:bg-green-900/30">
              <CheckCircle className="h-7 w-7 text-green-700 dark:text-green-300" />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-teal-500" style={{ width: `${completionRate}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            <MiniStat label="Attente" value={stats.pending} />
            <MiniStat label="Traitement" value={stats.inProgress} />
            <MiniStat label="Terminé" value={completed} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
      <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function AdminDashboard({ requests, stats }: { requests: RequestItem[]; stats: RequestStats }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="card-modern p-6 lg:col-span-2">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">File globale à assigner</h2>
          <Link href="/demandes" className="text-sm font-medium text-green-600 hover:text-green-700">
            Assigner
          </Link>
        </div>
        <RequestList requests={requests} staff />
      </div>

      <div className="space-y-4">
        <ActionCard href="/demandes" icon={ShieldCheck} title="Assignations" text={`${stats.pending + stats.inProgress} dossier(s) à suivre`} />
        <ActionCard href="/parametres/utilisateurs" icon={Users} title="Utilisateurs" text="Créer agents, managers, admins et citoyens" />
        <ActionCard href="/parametres/demandes" icon={FolderCog} title="Prix des demandes" text="Configurer les coûts visibles par les citoyens" />
        <ActionCard href="/reporting" icon={BarChart3} title="Indicateurs" text="Suivre les vrais chiffres de la plateforme" />
      </div>
    </div>
  );
}

function AgentDashboard({ requests, stats }: { requests: RequestItem[]; stats: RequestStats }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="card-modern p-6 lg:col-span-2">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mes demandes assignées</h2>
          <Link href="/demandes" className="text-sm font-medium text-green-600 hover:text-green-700">
            Ouvrir la file agent
          </Link>
        </div>
        <RequestList requests={requests} staff />
      </div>

      <div className="space-y-4">
        <ActionCard href="/demandes" icon={UserCheck} title="Traitement agent" text={`${stats.pending + stats.inProgress} dossier(s) dans votre file`} />
        <ActionCard href="/documents/generation" icon={FileText} title="Générer un document" text="Créer une pièce officielle liée à une demande" />
        <ActionCard href="/parametres/demandes" icon={FolderCog} title="Modèles de base" text="Téléverser les modèles Word/PDF utilisés au traitement" />
        <ActionCard href="/documents" icon={FolderCog} title="Documents actifs" text="Modifier, télécharger et classer les documents" />
        <ActionCard href="/documents/archives" icon={Archive} title="Archives" text="Retrouver les dossiers classés plus tard" />
      </div>
    </div>
  );
}

function CitizenDashboard({ requests, stats }: { requests: RequestItem[]; stats: RequestStats }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="card-modern p-6 lg:col-span-2">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mes dernières demandes</h2>
          <Link href="/demandes/suivi" className="text-sm font-medium text-green-600 hover:text-green-700">
            Suivre
          </Link>
        </div>
        <RequestList requests={requests} />
      </div>

      <div className="space-y-4">
        <ActionCard href="/demandes/nouvelle" icon={Plus} title="Déposer une demande" text="Créer une nouvelle demande municipale" />
        <ActionCard href="/profil" icon={UserRound} title="Mon profil" text="Mettre à jour commune, registre, téléphone et NIC" />
        <ActionCard href="/demandes/suivi" icon={FileText} title="Suivre mes dossiers" text={`${stats.total} demande(s) dans votre espace`} />
        <ActionCard href="/auth/logout" icon={XCircle} title="Déconnexion" text="Fermer votre session citoyenne" />
      </div>
    </div>
  );
}

function RequestList({ requests, staff = false }: { requests: RequestItem[]; staff?: boolean }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Aucune demande pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request, index) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{request.reference} - {request.subject}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {staff ? `${request.citizenName}${request.commune ? ` (${request.commune})` : ""} - ` : ""}{request.type} - {new Date(request.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {request.statusLabel}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="card-modern p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
          <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
      </div>
    </div>
  );
}

function ActionCard({ href, icon: Icon, title, text }: { href: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <Link href={href} className="card-modern block p-5 transition hover:border-green-300 dark:hover:border-green-700">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
          <Icon className="h-5 w-5 text-green-700 dark:text-green-300" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{text}</p>
        </div>
      </div>
    </Link>
  );
}
