"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search, Eye, Calendar, User, FileText, Download, Filter, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HistoriqueDemandes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const historique = [
    { id: "#DEM-001", type: "Certificat de naissance", citizen: "Marie Diouf", date: "15/06/2026", status: "Validée", user: "Admin" },
    { id: "#DEM-002", type: "Extrait de mariage", citizen: "Aliou Sow", date: "14/06/2026", status: "Validée", user: "Chef service" },
    { id: "#DEM-003", type: "Certificat de résidence", citizen: "Fatou Ndiaye", date: "13/06/2026", status: "Rejetée", user: "Admin" },
    { id: "#DEM-004", type: "Acte de naissance", citizen: "Moussa Diop", date: "12/06/2026", status: "Validée", user: "Agent" },
    { id: "#DEM-005", type: "Certificat de mariage", citizen: "Aissatou Fall", date: "11/06/2026", status: "En attente", user: "-" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Validée": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "Rejetée": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "En attente": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">?? Historique des demandes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Toutes les demandes traitées</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-modern w-full md:w-48"
          >
            <option value="all">Tous les statuts</option>
            <option value="validee">Validées</option>
            <option value="rejetee">Rejetées</option>
            <option value="attente">En attente</option>
          </select>
          <button className="btn-primary flex items-center gap-2">
            <Search size={18} />
            Rechercher
          </button>
          <button className="btn-secondary flex items-center gap-2" onClick={() => alert("?? Export en cours...")}>
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">N° Demande</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Citoyen</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Traitée par</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {historique.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{item.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{item.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{item.citizen}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{item.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{item.user}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Voir" onClick={() => alert(`?? Détails de ${item.id}`)}>
                      <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
