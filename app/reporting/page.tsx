"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, FileText, Users, Archive, Clock } from "lucide-react";

type ReportSummary = {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  totalUsers: number;
  citizens: number;
  agents: number;
  activeDocuments: number;
  archivedDocuments: number;
};

export default function Reporting() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/reports", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    };
    load();
  }, []);

  const stats = [
    { label: "Demandes", value: summary?.totalRequests ?? 0, icon: FileText },
    { label: "En traitement", value: summary?.inProgressRequests ?? 0, icon: Clock },
    { label: "Terminées", value: summary?.completedRequests ?? 0, icon: BarChart3 },
    { label: "Utilisateurs", value: summary?.totalUsers ?? 0, icon: Users },
  ];

  const exports = [
    { label: "Demandes", dataset: "requests" },
    { label: "Utilisateurs", dataset: "users" },
    { label: "Documents", dataset: "documents" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reporting</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Chiffres réels et exports.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card-modern p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString("fr-FR")}</p>
              </div>
              <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                <stat.icon className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-modern p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Mini label="Actifs" value={summary?.activeDocuments ?? 0} />
            <Mini label="Archivés" value={summary?.archivedDocuments ?? 0} icon={Archive} />
          </div>
        </div>
        <div className="card-modern p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comptes</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Mini label="Citoyens" value={summary?.citizens ?? 0} />
            <Mini label="Agents" value={summary?.agents ?? 0} />
          </div>
        </div>
      </div>

      <div className="card-modern p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Télécharger les rapports</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {exports.map((item) => (
            <a
              key={item.dataset}
              href={`/api/reports?format=csv&dataset=${item.dataset}`}
              className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition hover:border-green-300 hover:bg-green-50 dark:border-gray-800 dark:hover:bg-green-900/20"
            >
              <span className="font-semibold text-gray-900 dark:text-white">{item.label}</span>
              <Download className="h-5 w-5 text-green-700 dark:text-green-300" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, icon: Icon = FileText }: { label: string; value: number; icon?: typeof FileText }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
      <Icon className="h-5 w-5 text-green-700 dark:text-green-300" />
      <p className="mt-3 text-xl font-bold text-gray-900 dark:text-white">{value.toLocaleString("fr-FR")}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
