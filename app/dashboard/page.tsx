"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Inbox,
  Plus,
  Settings,
  ShieldCheck,
  UserCheck,
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
  const isStaff = Boolean(session?.user?.role);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bonjour, {displayName}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isStaff
              ? "Tableau de bord d'administration et de traitement des demandes."
              : "Votre espace citoyen personnel : demandes, traitement et suivi."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/demandes/nouvelle" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nouvelle demande
          </Link>
          {isStaff && (
            <Link href="/parametres" className="btn-secondary flex items-center gap-2">
              <Settings size={18} />
              Administration
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Total demandes" value={stats.total} />
        <StatCard icon={Clock} label="En attente" value={stats.pending} tone="yellow" />
        <StatCard icon={UserCheck} label="En traitement" value={stats.inProgress} tone="blue" />
        <StatCard icon={CheckCircle} label="Validées" value={stats.approved + stats.completed} tone="green" />
      </div>

      {isStaff ? (
        <AdminDashboard requests={recentRequests} stats={stats} />
      ) : (
        <CitizenDashboard requests={recentRequests} stats={stats} />
      )}
    </div>
  );
}

function AdminDashboard({ requests, stats }: { requests: RequestItem[]; stats: RequestStats }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="card-modern p-6 lg:col-span-2">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Demandes à traiter</h2>
          <Link href="/demandes" className="text-sm font-medium text-green-600 hover:text-green-700">
            Voir la file
          </Link>
        </div>
        <RequestList requests={requests} staff />
      </div>

      <div className="space-y-4">
        <ActionCard href="/demandes" icon={ShieldCheck} title="Traitement" text={`${stats.pending + stats.inProgress} demande(s) nécessitent une action`} />
        <ActionCard href="/parametres/utilisateurs" icon={Users} title="Utilisateurs" text="Créer et gérer les comptes agents" />
        <ActionCard href="/reporting" icon={BarChart3} title="Rapports" text="Consulter les indicateurs de la plateforme" />
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

function StatCard({ icon: Icon, label, value, tone = "emerald" }: { icon: typeof Inbox; label: string; value: number; tone?: string }) {
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

function ActionCard({ href, icon: Icon, title, text }: { href: string; icon: typeof Inbox; title: string; text: string }) {
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
