"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Plus,
  ChevronRight,
  Users,
  FileText,
  Calendar,
  Filter,
  Download,
  Printer,
  Edit,
  Trash2,
  AlertCircle,
  UserCheck,
  ArrowRight
} from "lucide-react";

export default function Demandes() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const stats = [
    { label: "Total demandes", value: "1,234", change: "+12%", icon: ClipboardList, color: "blue", link: "/demandes" },
    { label: "En attente", value: "45", change: "-5%", icon: Clock, color: "yellow", link: "/demandes?status=attente" },
    { label: "Validées", value: "189", change: "+18%", icon: CheckCircle, color: "green", link: "/demandes?status=validee" },
    { label: "Rejetées", value: "12", change: "-3%", icon: XCircle, color: "red", link: "/demandes?status=rejetee" },
  ];

  const requests = [
    { id: "#DEM-001", type: "Certificat de naissance", citizen: "Marie Diouf", date: "15/06/2024", status: "En attente", priority: "Haute" },
    { id: "#DEM-002", type: "Extrait de mariage", citizen: "Aliou Sow", date: "14/06/2024", status: "Validée", priority: "Moyenne" },
    { id: "#DEM-003", type: "Certificat de résidence", citizen: "Fatou Ndiaye", date: "13/06/2024", status: "En cours", priority: "Basse" },
    { id: "#DEM-004", type: "Acte de naissance", citizen: "Moussa Diop", date: "12/06/2024", status: "Rejetée", priority: "Haute" },
    { id: "#DEM-005", type: "Certificat de mariage", citizen: "Aissatou Fall", date: "11/06/2024", status: "En attente", priority: "Urgente" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Validée": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "Rejetée": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "En cours": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default: return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Validée": return <CheckCircle size={14} className="text-green-500" />;
      case "Rejetée": return <XCircle size={14} className="text-red-500" />;
      case "En cours": return <Clock size={14} className="text-blue-500" />;
      default: return <AlertCircle size={14} className="text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "Urgente": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "Haute": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "Moyenne": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Demandes citoyennes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion complète des demandes des citoyens</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/demandes/nouvelle" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nouvelle demande
          </Link>
          <Link href="/demandes/historique" className="btn-secondary flex items-center gap-2">
            <Clock size={18} />
            Historique
          </Link>
          <button className="btn-secondary flex items-center gap-2" onClick={() => window.print()}>
            <Printer size={18} />
            Imprimer
          </button>
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
                <p className={`text-xs mt-1 flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
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
              placeholder="Rechercher par nom, numéro de demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-modern w-full md:w-40"
          >
            <option value="all">Tous les statuts</option>
            <option value="attente">En attente</option>
            <option value="cours">En cours</option>
            <option value="validee">Validée</option>
            <option value="rejetee">Rejetée</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-modern w-full md:w-40"
          >
            <option value="all">Tous les types</option>
            <option value="certificat">Certificat</option>
            <option value="extrait">Extrait</option>
            <option value="attestation">Attestation</option>
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

      {/* Liste des demandes */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Demandes récentes</h3>
          <div className="flex gap-2">
            <Link href="/demandes/historique" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              Voir tout <ChevronRight size={16} />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">N° Demande</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Citoyen</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Priorité</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <motion.tr
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{req.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{req.type}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-gray-200">{req.citizen}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{req.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(req.priority)}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/demandes/${req.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Voir">
                        <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                      <Link href={`/demandes/modifier/${req.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Modifier">
                        <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                      <Link href={`/demandes/suivi/${req.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Suivre">
                        <UserCheck size={16} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition" title="Supprimer" onClick={() => { if(confirm("Supprimer cette demande ?")) alert("🗑️ Demande supprimée!") }}>
                        <Trash2 size={16} className="text-red-500" />
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Affichage 1-5 sur 1,234 demandes</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Précédent</button>
            <button className="px-3 py-1 rounded-lg bg-green-600 text-white">1</button>
            <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">2</button>
            <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">3</button>
            <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Suivant</button>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/demandes/nouvelle" className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 group-hover:scale-110 transition-transform">
              <Plus size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Nouvelle demande</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Créer une demande</p>
            </div>
          </div>
        </Link>
        <Link href="/demandes/suivi" className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
              <UserCheck size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Suivi des demandes</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Suivi en temps réel</p>
            </div>
          </div>
        </Link>
        <Link href="/demandes/historique" className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20 group-hover:scale-110 transition-transform">
              <Clock size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Historique</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toutes les demandes</p>
            </div>
          </div>
        </Link>
        <Link href="/reporting" className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/20 group-hover:scale-110 transition-transform">
              <ArrowRight size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Statistiques</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Voir les rapports</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
