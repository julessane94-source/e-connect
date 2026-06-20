"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Eye, 
  Trash2,
  Plus,
  FolderOpen,
  Archive,
  File,
  Image,
  FileSpreadsheet,
  QrCode,
  Filter,
  Grid,
  List,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function Documents() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const stats = [
    { label: "Documents total", value: "1,234", icon: FileText, color: "blue", link: "/documents" },
    { label: "En attente", value: "56", icon: Clock, color: "yellow", link: "/documents/archives" },
    { label: "Archivés", value: "890", icon: Archive, color: "gray", link: "/documents/archives" },
    { label: "Récents", value: "23", icon: FolderOpen, color: "green", link: "/documents" },
  ];

  const documents = [
    { name: "Certificat de naissance #2024-001.pdf", type: "PDF", size: "245 KB", date: "15/06/2024", status: "Validé", category: "Certificat" },
    { name: "Extrait de mariage #2024-012.pdf", type: "PDF", size: "189 KB", date: "14/06/2024", status: "En attente", category: "Extrait" },
    { name: "Acte de décès #2024-008.pdf", type: "PDF", size: "312 KB", date: "13/06/2024", status: "Validé", category: "Acte" },
    { name: "Jugement supplétif #2024-003.pdf", type: "PDF", size: "456 KB", date: "12/06/2024", status: "Validé", category: "Jugement" },
    { name: "Attestation de résidence #2024-015.pdf", type: "PDF", size: "178 KB", date: "11/06/2024", status: "Rejeté", category: "Attestation" },
    { name: "Certificat de mariage #2024-009.pdf", type: "PDF", size: "234 KB", date: "10/06/2024", status: "En attente", category: "Certificat" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Validé": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "En attente": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Rejeté": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📄 Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion documentaire complète</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary flex items-center gap-2" onClick={() => alert("📤 Fenêtre d'upload ouverte")}>
            <Upload size={18} />
            Importer
          </button>
          <Link href="/documents/generation" className="btn-secondary flex items-center gap-2">
            <Plus size={18} />
            Générer
          </Link>
          <Link href="/documents/archives" className="btn-secondary flex items-center gap-2">
            <Archive size={18} />
            Archives
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push(stat.link)}
            className="card-modern p-6 cursor-pointer hover:border-green-300 dark:hover:border-green-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} className={`text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recherche et Filtres */}
      <div className="card-modern p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un document par nom, type, catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-modern w-full md:w-40"
          >
            <option value="all">Tous les types</option>
            <option value="pdf">PDF</option>
            <option value="image">Images</option>
            <option value="excel">Excel</option>
            <option value="word">Word</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-modern w-full md:w-40"
          >
            <option value="all">Tous les statuts</option>
            <option value="valide">Validés</option>
            <option value="attente">En attente</option>
            <option value="rejete">Rejetés</option>
          </select>
          <button className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Search size={18} />
            Rechercher
          </button>
          <button className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <Filter size={18} />
            Filtrer
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    doc.type === "PDF" ? "bg-red-100 dark:bg-red-900/20" :
                    doc.type === "Image" ? "bg-purple-100 dark:bg-purple-900/20" :
                    "bg-blue-100 dark:bg-blue-900/20"
                  } group-hover:scale-110 transition-transform`}>
                    {doc.type === "PDF" ? <FileText size={24} className="text-red-600 dark:text-red-400" /> :
                     doc.type === "Image" ? <Image size={24} className="text-purple-600 dark:text-purple-400" /> :
                     <FileSpreadsheet size={24} className="text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{doc.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                    </div>
                    <span className="text-xs text-gray-400">{doc.category}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Voir" onClick={() => alert(`👀 Aperçu de ${doc.name}`)}>
                  <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Télécharger" onClick={() => alert(`⬇️ Téléchargement de ${doc.name}`)}>
                  <Download size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="QR Code" onClick={() => alert(`📱 QR Code généré pour ${doc.name}`)}>
                  <QrCode size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition" title="Supprimer" onClick={() => { if(confirm(`Supprimer ${doc.name} ?`)) alert("🗑️ Document supprimé!") }}>
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card-modern p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{doc.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{doc.type}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{doc.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{doc.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Voir" onClick={() => alert(`👀 Aperçu de ${doc.name}`)}>
                          <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Télécharger" onClick={() => alert(`⬇️ Téléchargement de ${doc.name}`)}>
                          <Download size={16} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition" title="Supprimer" onClick={() => { if(confirm(`Supprimer ${doc.name} ?`)) alert("🗑️ Document supprimé!") }}>
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">Affichage 1-6 sur 1,234 documents</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Précédent</button>
          <button className="px-3 py-1 rounded-lg bg-green-600 text-white">1</button>
          <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">2</button>
          <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">3</button>
          <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Suivant</button>
        </div>
      </div>
    </div>
  );
}
