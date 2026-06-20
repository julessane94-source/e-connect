"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Baby, 
  Users, 
  Heart, 
  Scale, 
  Search, 
  FileText, 
  Printer,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Upload
} from "lucide-react";

export default function EtatCivil() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const stats = [
    { label: "Naissances", value: "1,234", change: "+12%", icon: Baby, color: "blue", link: "/etat-civil/naissances" },
    { label: "Mariages", value: "567", change: "+8%", icon: Heart, color: "pink", link: "/etat-civil/mariages" },
    { label: "Décès", value: "89", change: "-3%", icon: Users, color: "gray", link: "/etat-civil/deces" },
    { label: "Jugements", value: "45", change: "+15%", icon: Scale, color: "purple", link: "/etat-civil/jugements" },
  ];

  const recentRecords = [
    { id: "#2024-001", type: "Naissance", name: "Moussa Diop", date: "15/06/2024", status: "Validé", lieu: "Dakar" },
    { id: "#2024-002", type: "Mariage", name: "Diop - Fall", date: "10/06/2024", status: "En attente", lieu: "Thiès" },
    { id: "#2024-003", type: "Décès", name: "Abdoulaye Ndiaye", date: "05/06/2024", status: "Validé", lieu: "Saint-Louis" },
    { id: "#2024-004", type: "Jugement", name: "Jugement naissance", date: "01/06/2024", status: "Validé", lieu: "Dakar" },
    { id: "#2024-005", type: "Naissance", name: "Aissatou Sow", date: "28/05/2024", status: "Rejeté", lieu: "Thiès" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Validé": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "En attente": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Rejeté": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Validé": return <CheckCircle size={14} className="text-green-500" />;
      case "En attente": return <Clock size={14} className="text-yellow-500" />;
      case "Rejeté": return <XCircle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 État Civil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion complète des actes d'état civil</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/etat-civil/naissances/nouvelle" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nouvel acte
          </Link>
          <button className="btn-secondary flex items-center gap-2" onClick={() => window.print()}>
            <Printer size={18} />
            Imprimer
          </button>
          <Link href="/etat-civil/recherche" className="btn-secondary flex items-center gap-2">
            <Search size={18} />
            Recherche avancée
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
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 text-${stat.color}-600`}>
                  <TrendingUp size={12} />
                  {stat.change} ce mois
                </p>
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
              placeholder="Rechercher par nom, numéro d'acte, lieu..."
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
            <option value="naissance">Naissances</option>
            <option value="mariage">Mariages</option>
            <option value="deces">Décès</option>
            <option value="jugement">Jugements</option>
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
        </div>
      </div>

      {/* Liste des actes */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Derniers actes</h3>
          <div className="flex gap-2">
            <Link href="/etat-civil/recherche" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              Voir tout <ChevronRight size={16} />
            </Link>
            <Link href="/etat-civil/reimpression" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Réimpression
            </Link>
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
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Lieu</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{record.id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      record.type === "Naissance" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                      record.type === "Mariage" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" :
                      record.type === "Décès" ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300" :
                      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-gray-200">{record.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{record.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{record.lieu}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/etat-civil/voir/${record.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Voir">
                        <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                      <Link href={`/etat-civil/modifier/${record.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Modifier">
                        <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition" title="Supprimer" onClick={() => { if(confirm("Supprimer cet acte ?")) alert("🗑️ Acte supprimé!") }}>
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                      <Link href={`/etat-civil/reimpression/${record.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Réimprimer">
                        <Printer size={16} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Télécharger" onClick={() => alert("⬇️ Téléchargement en cours...")}>
                        <Download size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Affichage 1-5 sur 1,234 actes</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Précédent</button>
            <button className="px-3 py-1 rounded-lg bg-green-600 text-white">1</button>
            <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">2</button>
            <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">3</button>
            <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Suivant</button>
          </div>
        </div>
      </div>

      {/* Accès rapides - Catégories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/etat-civil/naissances" className="card-modern p-6 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
              <Baby size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Naissances</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les actes</p>
            </div>
          </div>
        </Link>
        <Link href="/etat-civil/mariages" className="card-modern p-6 hover:border-pink-300 dark:hover:border-pink-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/20 group-hover:scale-110 transition-transform">
              <Heart size={24} className="text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Mariages</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les actes</p>
            </div>
          </div>
        </Link>
        <Link href="/etat-civil/deces" className="card-modern p-6 hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform">
              <Users size={24} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Décès</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les actes</p>
            </div>
          </div>
        </Link>
        <Link href="/etat-civil/jugements" className="card-modern p-6 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20 group-hover:scale-110 transition-transform">
              <Scale size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Jugements</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les actes</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
