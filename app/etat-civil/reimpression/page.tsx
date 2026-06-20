"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Printer, Search, ChevronLeft, Download, Eye } from "lucide-react";
import Link from "next/link";

export default function Reimpression() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const actes = [
    { id: "#2024-001", type: "Naissance", name: "Moussa Diop", date: "15/06/2024", copies: 0 },
    { id: "#2024-002", type: "Mariage", name: "Diop - Fall", date: "10/06/2024", copies: 1 },
    { id: "#2024-003", type: "Décès", name: "Abdoulaye Ndiaye", date: "05/06/2024", copies: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/etat-civil" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🖨️ Réimpression</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Réimpression des actes d'état civil</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Numéro d'acte, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Search size={18} />
            Rechercher
          </button>
        </div>
      </div>

      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actes disponibles</h3>
        <div className="space-y-3">
          {actes.map((acte, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{acte.id} - {acte.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{acte.type} - {acte.date}</p>
                <p className="text-xs text-gray-400">Copies déjà imprimées: {acte.copies}</p>
              </div>
              <button className="btn-primary flex items-center gap-2" onClick={() => alert("🖨️ Impression en cours...")}>
                <Printer size={16} />
                Réimprimer
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
