"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Eye, ChevronLeft, Printer, Download } from "lucide-react";
import Link from "next/link";

export default function RechercheEtatCivil() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const mockResults = [
    { id: "#2024-001", type: "Naissance", name: "Moussa Diop", date: "15/06/2024", status: "Validé" },
    { id: "#2024-002", type: "Mariage", name: "Diop - Fall", date: "10/06/2024", status: "En attente" },
    { id: "#2024-003", type: "Décès", name: "Abdoulaye Ndiaye", date: "05/06/2024", status: "Validé" },
  ];

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setResults(mockResults);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/etat-civil" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔍 Recherche multicritère</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Recherche avancée dans l'état civil</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Nom, prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full pl-10"
              />
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="input-modern w-full"
            >
              <option value="all">Tous les types</option>
              <option value="naissance">Naissance</option>
              <option value="mariage">Mariage</option>
              <option value="deces">Décès</option>
              <option value="jugement">Jugement</option>
            </select>
            <button onClick={handleSearch} className="btn-primary flex items-center justify-center gap-2">
              <Search size={18} />
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Résultats ({results.length})</h3>
            <div className="flex gap-2">
              <button className="btn-secondary flex items-center gap-2" onClick={() => window.print()}>
                <Printer size={16} /> Imprimer
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">N° Acte</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <motion.tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-sm font-medium">{result.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{result.type}</td>
                    <td className="py-3 px-4 text-sm">{result.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{result.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${result.status === "Validé" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {result.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
