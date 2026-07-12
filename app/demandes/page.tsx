"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

type RequestItem = {
  id: string;
  requestTypeId?: string | null;
  reference: string;
  type: string;
  subject: string;
  citizenName: string;
  citizenEmail: string;
  commune?: string | null;
  price: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentLabel?: string;
  withdrawalMethod: string;
  withdrawalLabel?: string;
  attachmentName?: string | null;
  assignedToId?: string | null;
  assignedTo?: { firstName: string; lastName: string; email: string } | null;
  signedAt?: string | null;
  downloadEnabled: boolean;
  urgency: string;
  status: string;
  statusLabel: string;
  createdAt: string;
};

type AgentItem = {
  id: string;
  name: string;
  role: string;
  commune?: string | null;
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
  const role = session?.user?.role || null;
  const isStaff = Boolean(role);
  const isAdmin = role === "ADMIN";
  const isAgent = isStaff && !isAdmin;
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [stats, setStats] = useState<RequestStats>({ total: 0, pending: 0, inProgress: 0, approved: 0, rejected: 0, completed: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    if (isStaff) {
      fetch("/api/users", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => setAgents((data?.users ?? []).filter((user: AgentItem) => ["AGENT", "MANAGER"].includes(user.role))))
        .catch(() => setAgents([]));
    }
  }, [isStaff]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = `${request.reference} ${request.subject} ${request.citizenName} ${request.type} ${request.commune || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const selectedTypeKey = useMemo(() => {
    const selectedRequest = requests.find((request) => request.id === selectedIds[0]);
    return selectedRequest ? selectedRequest.requestTypeId || selectedRequest.type : "";
  }, [requests, selectedIds]);

  const compatibleBatchIds = useMemo(() => {
    if (!selectedTypeKey) return filteredRequests.map((request) => request.id);
    return filteredRequests
      .filter((request) => (request.requestTypeId || request.type) === selectedTypeKey)
      .map((request) => request.id);
  }, [filteredRequests, selectedTypeKey]);

  const updateRequest = async (id: string, action: string, extra: Record<string, string> = {}) => {
    setMessage("");
    setError("");
    const response = await fetch(`/api/demandes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });

    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      setMessage(action === "archive" ? "Dossier archivé." : "Demande mise à jour.");
      await loadRequests();
      return;
    }

    setError(payload.message || "Action impossible sur cette demande.");
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);

      const nextRequest = requests.find((request) => request.id === id);
      const currentRequest = requests.find((request) => request.id === current[0]);
      if (currentRequest && nextRequest && (currentRequest.requestTypeId || currentRequest.type) !== (nextRequest.requestTypeId || nextRequest.type)) {
        setError("Le publipostage regroupe uniquement des demandes du même type.");
        return current;
      }

      setError("");
      return [...current, id];
    });
  };

  const selectCompatibleBatch = () => {
    setSelectedIds(compatibleBatchIds);
    setError("");
  };

  const batchProcess = async (action: "generate" | "complete") => {
    setMessage("");
    setError("");
    const response = await fetch("/api/demandes/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, action }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || "Traitement groupé impossible.");
      return;
    }
    setMessage(`${payload.count || 0} document(s) généré(s).`);
    setSelectedIds([]);
    await loadRequests();
  };

  const title = isAdmin ? "Administration des demandes" : isAgent ? "Mes demandes assignées" : "Mes demandes";
  const subtitle = isAdmin
    ? "Assigner chaque demande à un agent et suivre la file globale."
    : isAgent
      ? "Traiter uniquement les dossiers que l'admin vous a assignés."
      : "Déposez et suivez uniquement vos propres demandes.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!isStaff && (
            <Link href="/demandes/nouvelle" className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Nouvelle demande
            </Link>
          )}
          {isAgent && (
            <Link href="/documents/generation" className="btn-primary flex items-center gap-2">
              <FileText size={18} />
              Générer un document
            </Link>
          )}
          <Link href="/demandes/suivi" className="btn-secondary flex items-center gap-2">
            <UserCheck size={18} />
            Suivi citoyen
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={isAgent ? "Assignées" : "Total"} value={stats.total} icon={FileText} />
        <Stat label="En attente" value={stats.pending} icon={Clock} />
        <Stat label="En traitement" value={stats.inProgress} icon={ShieldCheck} />
        <Stat label="Terminées" value={stats.approved + stats.completed} icon={CheckCircle} />
      </div>

      {(message || error) && (
        <div className={`rounded-xl border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error || message}
        </div>
      )}

      {isStaff && (
        <div className="card-modern flex flex-col gap-3 border-green-200 bg-green-50/60 p-4 dark:border-green-900/60 dark:bg-green-950/20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Publipostage des demandes similaires</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cochez plusieurs demandes du même type pour générer les documents en un seul traitement. {selectedIds.length} demande(s) sélectionnée(s).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={filteredRequests.length === 0} onClick={selectCompatibleBatch} className="btn-secondary disabled:opacity-50">
              Sélectionner compatibles
            </button>
            <button disabled={selectedIds.length === 0} onClick={() => batchProcess("generate")} className="btn-secondary disabled:opacity-50">
              Générer le lot
            </button>
            <button disabled={selectedIds.length === 0} onClick={() => batchProcess("complete")} className="btn-primary disabled:opacity-50">
              Générer et clôturer
            </button>
          </div>
        </div>
      )}

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
            {isAgent ? "Aucune demande ne vous est assignée pour le moment." : "Aucune demande trouvée."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {isStaff && <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Lot</th>}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Objet</th>
                  {isStaff && <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Citoyen / commune</th>}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Paiement / retrait</th>
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
                    {isStaff && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(request.id)}
                          disabled={Boolean(selectedTypeKey) && !selectedIds.includes(request.id) && (request.requestTypeId || request.type) !== selectedTypeKey}
                          onChange={() => toggleSelected(request.id)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {request.reference}
                      <span className="block text-xs font-normal text-gray-400">{new Date(request.createdAt).toLocaleDateString("fr-FR")}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">{request.subject}</span>
                      <span className="block text-xs text-gray-400">{request.type}</span>
                      {request.attachmentName && <span className="block text-xs text-blue-500">Pièce jointe : {request.attachmentName}</span>}
                      {request.downloadEnabled && <span className="block text-xs text-green-600">Dossier signé publié au citoyen</span>}
                    </td>
                    {isStaff && (
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {request.citizenName}
                        {request.commune && <span className="block text-xs text-gray-400">{request.commune}</span>}
                        {request.assignedTo && (
                          <span className="block text-xs text-green-600">
                            Agent : {request.assignedTo.firstName} {request.assignedTo.lastName}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <span className="font-medium">{request.price.toLocaleString("fr-FR")} FCFA</span>
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${request.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {request.paymentStatus === "PAID" ? "Payé" : "À payer"}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {request.paymentLabel || (request.paymentMethod === "COUNTER" ? "Paiement au guichet" : "Paiement à distance")}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {request.withdrawalLabel || (request.withdrawalMethod === "COUNTER" ? "Retrait au guichet" : "Téléchargement")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[request.status] ?? statusStyles.PENDING}`}>
                        {request.statusLabel}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {isAdmin && (
                            <select
                              defaultValue={request.assignedToId || ""}
                              onChange={(event) => event.target.value && updateRequest(request.id, "assign", { agentId: event.target.value })}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
                            >
                              <option value="">Assigner</option>
                              {agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                  {agent.commune ? `${agent.name} - ${agent.commune}` : agent.name}
                                </option>
                              ))}
                            </select>
                          )}
                          {isAgent && (
                            <select
                              defaultValue=""
                              onChange={(event) => event.target.value && updateRequest(request.id, "transfer", { agentId: event.target.value })}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
                            >
                              <option value="">Transférer</option>
                              {agents
                                .filter((agent) => agent.id !== request.assignedToId)
                                .map((agent) => (
                                  <option key={agent.id} value={agent.id}>
                                    {agent.commune ? `${agent.name} - ${agent.commune}` : agent.name}
                                  </option>
                                ))}
                            </select>
                          )}
                          {isAgent && request.status === "PENDING" && (
                            <button onClick={() => updateRequest(request.id, "start")} className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">
                              Prendre
                            </button>
                          )}
                          {isStaff && request.price > 0 && request.paymentStatus !== "PAID" && (
                            <button onClick={() => updateRequest(request.id, "markPaid")} className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200">
                              Marquer payé
                            </button>
                          )}
                          {isAgent && ["IN_PROGRESS", "APPROVED"].includes(request.status) && (
                            <Link href={`/documents/generation?requestId=${request.id}`} className="rounded-lg bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200">
                              Générer
                            </Link>
                          )}
                          {isAgent && ["PENDING", "IN_PROGRESS"].includes(request.status) && (
                            <>
                              <button onClick={() => updateRequest(request.id, "approve")} className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200">
                                Valider
                              </button>
                              <button onClick={() => updateRequest(request.id, "reject")} className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200">
                                Rejeter
                              </button>
                            </>
                          )}
                          {isAgent && ["IN_PROGRESS", "APPROVED"].includes(request.status) && (
                            <button onClick={() => updateRequest(request.id, "sign")} className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200">
                              Signer
                            </button>
                          )}
                          {isAgent && request.status === "COMPLETED" && (
                            <button onClick={() => updateRequest(request.id, "archive")} className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200">
                              <Archive size={13} />
                              Archiver
                            </button>
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

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
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
