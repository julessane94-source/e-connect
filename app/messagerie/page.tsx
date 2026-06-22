"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, Paperclip, Search, Send, Users } from "lucide-react";
import { useSession } from "next-auth/react";

type Agent = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
};

type RequestOption = {
  id: string;
  reference: string;
  subject: string;
};

type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileData?: string | null;
  requestId?: string | null;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; email: string };
  recipient: { id: string; firstName: string; lastName: string; email: string };
  request?: { id: string; reference: string; subject: string } | null;
};

export default function Messagerie() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [requests, setRequests] = useState<RequestOption[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);
  const currentUserId = session?.user?.id;

  const visibleAgents = useMemo(
    () => agents.filter((agent) => `${agent.name} ${agent.email} ${agent.department}`.toLowerCase().includes(search.toLowerCase())),
    [agents, search]
  );

  const conversation = useMemo(
    () => messages.filter((item) => item.senderId === selectedAgentId || item.recipientId === selectedAgentId),
    [messages, selectedAgentId]
  );

  const loadMessages = async () => {
    setLoading(true);
    const response = await fetch("/api/messages", { cache: "no-store" });
    setLoading(false);
    if (!response.ok) {
      setError("Messagerie réservée aux agents.");
      return;
    }
    const data = await response.json();
    setAgents(data.agents || []);
    setMessages(data.messages || []);
    setRequests(data.requests || []);
    setSelectedAgentId((current) => current || data.agents?.[0]?.id || "");
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleFile = (selected?: File) => {
    if (!selected) return;
    const reader = new FileReader();
    reader.onload = () => setFile({ name: selected.name, type: selected.type || "application/octet-stream", data: String(reader.result || "") });
    reader.readAsDataURL(selected);
  };

  const sendMessage = async () => {
    if (!selectedAgentId || (!message.trim() && !file)) return;
    setSending(true);
    setError("");
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: selectedAgentId,
        requestId: requestId || undefined,
        message,
        fileName: file?.name,
        mimeType: file?.type,
        fileData: file?.data,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    setSending(false);

    if (!response.ok) {
      setError(payload.message || "Envoi impossible.");
      return;
    }

    setMessages((current) => [...current, payload.message]);
    setMessage("");
    setFile(null);
  };

  const downloadFile = (item: Message) => {
    if (!item.fileData) return;
    const link = document.createElement("a");
    link.href = item.fileData;
    link.download = item.fileName || "document";
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messagerie agents</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Partage d'informations, documents et dossiers entre agents.</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-modern p-4 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-700" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Agents</h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} type="text" placeholder="Rechercher un agent..." className="input-modern w-full pl-10" />
          </div>

          {loading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Chargement...</div>
          ) : (
            <div className="max-h-[620px] space-y-2 overflow-y-auto">
              {visibleAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full rounded-xl p-3 text-left transition ${selectedAgentId === agent.id ? "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{agent.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{agent.role} - {agent.department}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card-modern flex h-[680px] flex-col p-4 lg:col-span-2">
          <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white">{selectedAgent?.name || "Sélectionner un agent"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedAgent?.email || "Choisissez un destinataire pour commencer."}</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto py-4">
            {conversation.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
                Aucun message avec cet agent.
              </div>
            ) : (
              conversation.map((item, index) => {
                const mine = item.senderId === currentUserId;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${mine ? "bg-green-700 text-white" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"}`}>
                      <p className="text-sm leading-6">{item.message}</p>
                      {item.request && (
                        <div className={`mt-2 rounded-xl px-3 py-2 text-xs ${mine ? "bg-white/15" : "bg-white dark:bg-gray-900"}`}>
                          <FileText className="mr-1 inline h-3.5 w-3.5" />
                          {item.request.reference} - {item.request.subject}
                        </div>
                      )}
                      {item.fileData && (
                        <button onClick={() => downloadFile(item)} className={`mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${mine ? "bg-white text-green-800" : "bg-green-100 text-green-800"}`}>
                          <Download size={14} />
                          {item.fileName || "Télécharger le document"}
                        </button>
                      )}
                      <p className={`mt-2 text-xs ${mine ? "text-green-100" : "text-gray-500"}`}>{new Date(item.createdAt).toLocaleString("fr-FR")}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto]">
              <select value={requestId} onChange={(event) => setRequestId(event.target.value)} className="input-modern w-full">
                <option value="">Associer un dossier (optionnel)</option>
                {requests.map((item) => (
                  <option key={item.id} value={item.id}>{item.reference} - {item.subject}</option>
                ))}
              </select>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900">
                <Paperclip size={18} />
                Joindre
                <input type="file" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
              </label>
            </div>
            {file && <p className="mb-2 text-xs text-green-700 dark:text-green-300">Document prêt : {file.name}</p>}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Écrire une information à partager..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="input-modern flex-1"
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
              />
              <button onClick={sendMessage} disabled={sending || !selectedAgentId || (!message.trim() && !file)} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
