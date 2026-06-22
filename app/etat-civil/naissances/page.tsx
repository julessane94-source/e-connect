"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Eye, Edit, Trash2, Printer, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Naissances() {
  const [searchTerm, setSearchTerm] = useState("");

  const births = [
    { id: "#2026-001", firstName: "Moussa", lastName: "Diop", birthDate: "15/06/2026", birthPlace: "Sédhiou", status: "Validé" },
    { id: "#2026-002", firstName: "Aissatou", lastName: "Sow", birthDate: "18/06/2026", birthPlace: "Marsassoum", status: "En attente" },
    { id: "#2026-003", firstName: "Ibrahim", lastName: "Ndiaye", birthDate: "20/06/2026", birthPlace: "Goudomp", status: "Validé" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/etat-civil" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">?? Naissances</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion des actes de naissance</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nouvel acte
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Printer size={18} />
            Imprimer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">N° Acte</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Prénom</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date naissance</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Lieu</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {births.map((birth, index) => (
                <motion.tr
                  key={birth.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{birth.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{birth.firstName}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{birth.lastName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{birth.birthDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{birth.birthPlace}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      birth.status === "Validé" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}>
                      {birth.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"><Eye size={16} className="text-gray-600 dark:text-gray-400" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"><Edit size={16} className="text-gray-600 dark:text-gray-400" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
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
