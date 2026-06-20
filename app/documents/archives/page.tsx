"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Search, Eye, Download, Trash2, FolderOpen, FileText, Calendar, ChevronRight } from "lucide-react";

export default function Archives() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");

  const archives = [
    { id: 1, name: "Certificats 2023", docs: 234, size: "45 MB", date: "01/01/2024", category: "Certificats" },
    { id: 2, name: "Actes de naissance 2022", docs: 567, size: "89 MB", date: "15/12/2023", category: "Naissances" },
    { id: 3, name: "Mariages 2021", docs: 123, size: "23 MB", date: "30/11/2023", category: "Mariages" },
    { id: 4, name: "Décès 2020-2021", docs: 89, size: "12 MB", date: "15/10/2023", category: "Décès" },
    { id: 5, name: "Jugements 2022-2023", docs: 156, size: "34 MB", date: "01/09/2023", category: "Jugements" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📁 Archives</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Documents archivés</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher dans les archives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-modern w-full md:w-48"
          >
            <option value="all">Toutes les années</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
          <button className="btn-primary flex items-center gap-2">
            <Search size={18} />
            Rechercher
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {archives.map((archive, index) => (
          <motion.div
            key={archive.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
                  <FolderOpen size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{archive.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{archive.docs} documents</span>
                    <span>•</span>
                    <span>{archive.size}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Calendar size={12} />
                    {archive.date}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Voir" onClick={() => alert(`👀 Aperçu de ${archive.name}`)}>
                <Eye size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Télécharger" onClick={() => alert(`⬇️ Téléchargement de ${archive.name}`)}>
                <Download size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition" title="Supprimer" onClick={() => { if(confirm(`Supprimer ${archive.name} ?`)) alert("🗑️ Archive supprimée!") }}>
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
