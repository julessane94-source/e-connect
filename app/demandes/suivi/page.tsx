"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle, Clock, Download, FileText, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { PDFGenerator } from "@/services/pdf/pdfGenerator";

type RequestEvent = {
  id: string;
  action: string;
  actorName: string;
  note?: string;
  createdAt: string;
};

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
  attachmentName?: string | null;
  signedDocumentName?: string | null;
  signedDocumentContent?: string | null;
  downloadEnabled: boolean;
  createdAt: string;
  events: RequestEvent[];
};

const steps = ["PENDING", "IN_PROGRESS", "APPROVED", "COMPLETED"];

export default function SuiviDemandes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      const response = await fetch("/api/demandes", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests ?? []);
      }
      setLoading(false);
    };

    loadRequests();
  }, []);

  const filtered = requests.filter((request) =>
    `${request.reference} ${request.subject} ${request.type}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suivi des demandes</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Consultez l'état de traitement de vos dossiers.</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Numéro, objet ou type de demande..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="input-modern w-full pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="card-modern p-8 text-center text-gray-500">Chargement du suivi...</div>
      ) : filtered.length === 0 ? (
        <div className="card-modern p-8 text-center text-gray-500">Aucune demande à suivre.</div>
      ) : (
        filtered.map((request, index) => <RequestTracking key={request.id} request={request} index={index} />)
      )}
    </div>
  );
}

function RequestTracking({ request, index }: { request: RequestItem; index: number }) {
  const currentIndex = request.status === "REJECTED" ? 1 : Math.max(0, steps.indexOf(request.status));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card-modern p-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">{request.reference}</h2>
            <StatusBadge status={request.status} label={request.statusLabel} />
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {request.subject} - {request.type}{request.commune ? ` - ${request.commune}` : ""}
          </p>
          <p className="mt-1 text-sm font-medium text-green-700 dark:text-green-300">
            Coût : {request.price.toLocaleString("fr-FR")} FCFA
          </p>
          {request.attachmentName && <p className="mt-1 text-xs text-blue-500">Pièce jointe envoyée : {request.attachmentName}</p>}
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <p className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString("fr-FR")}</p>
          {request.downloadEnabled && request.signedDocumentContent && (
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
              onClick={() => PDFGenerator.generateText(request.signedDocumentContent || "", request.signedDocumentName || `${request.reference}.pdf`)}
            >
              <Download size={16} />
              Télécharger le dossier signé
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {["Dépôt", "Traitement", "Validation", "Clôture"].map((label, stepIndex) => (
          <div key={label} className="text-center">
            <div className={`mx-auto h-2 rounded-full ${stepIndex <= currentIndex ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Historique</h3>
        <div className="space-y-3">
          {request.events.map((event) => (
            <div key={event.id} className="flex gap-3 text-sm">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{event.action}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.createdAt).toLocaleString("fr-FR")} par {event.actorName}
                </p>
                {event.note && <p className="mt-1 text-xs text-gray-500">{event.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const className =
    status === "REJECTED"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      : status === "APPROVED" || status === "COMPLETED"
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        : status === "IN_PROGRESS"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";

  const Icon = status === "REJECTED" ? XCircle : status === "PENDING" ? Clock : status === "IN_PROGRESS" ? FileText : CheckCircle;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}
