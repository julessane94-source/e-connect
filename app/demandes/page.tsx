"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

type RequestItem = {
  id: string;
  reference: string;
  type: string;
  subject: string;
  citizenName: string;
  citizenEmail: string;
  urgency: string;
  status: string;
  statusLabel: string;
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

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function Demandes() {
  const { data: session } = useSession();
  const isStaff = Boolean(session?.user?.role);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState<RequestStats>({ total: 0, pending: 0, inProgress: 0, approved: 0, rejected: 0, completed: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    const response = await fetch("/api/demandes", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setRequests(data.requests ?? []);
      setStats(data.stats ?? stats);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = `${request.reference} ${request.subject} ${request.citizenName} ${request.type}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const updateRequest = async (id: string, action: string) => {
    const response = await fetch(`/api/demandes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      await loadRequests();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isStaff ? "Traitement des demandes" : "Mes demandes"}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isStaff ? "File de traitement des demandes citoyennes." : "Déposez et suivez uniquement vos propres demandes."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/demandes/nouvelle" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nouvelle demande
          </Link>
          <Link href="/demandes/suivi" className="btn-secondary flex items-center gap-2">
            <UserCheck size={18} />
            Suivi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total" value={stats.total} icon={FileText} />
        <Stat label="En attente" value={stats.pending} icon={Clock} />
        <Stat label="En traitement" value={stats.inProgress} icon={ShieldCheck} />
        <Stat label="Clôturées" value={stats.approved + stats.completed} icon={CheckCircle} />
      </div>

      <div className="card-modern p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-modern w-full md:w-56">
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="IN_PROGRESS">En traitement</option>
            <option value="APPROVED">Validée</option>
            <option value="REJECTED">Rejetée</option>
            <option value="COMPLETED">Terminée</option>
          </select>
        </div>
      </div>

      <div className="card-modern p-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement des demandes...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
            Aucune demande trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Objet</th>
                  {isStaff && <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Citoyen</th>}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
                  {isStaff && <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Traitement</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{request.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">{request.subject}</span>
                      <span className="block text-xs text-gray-400">{request.type}</span>
                    </td>
                    {isStaff && <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{request.citizenName}</td>}
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[request.status] ?? statusStyles.PENDING}`}>
                        {request.statusLabel}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {request.status === "PENDING" && (
                            <button onClick={() => updateRequest(request.id, "start")} className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">
                              Traiter
                            </button>
                          )}
                          {["PENDING", "IN_PROGRESS"].includes(request.status) && (
                            <>
                              <button onClick={() => updateRequest(request.id, "approve")} className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200">
                                Valider
                              </button>
                              <button onClick={() => updateRequest(request.id, "reject")} className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200">
                                Rejeter
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
