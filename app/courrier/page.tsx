"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Inbox, 
  Send, 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Mail,
  MailOpen,
  Archive,
  Filter,
  Download,
  Printer,
  Edit,
  Trash2,
  FileText,
  Users,
  Calendar,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function Courrier() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const stats = [
    { label: "Courrier entrant", value: "234", change: "+15%", icon: Inbox, color: "blue", link: "/courrier/entrant" },
    { label: "Courrier sortant", value: "156", change: "+8%", icon: Send, color: "green", link: "/courrier/sortant" },
    { label: "En attente", value: "45", change: "-5%", icon: Clock, color: "yellow", link: "/courrier?status=attente" },
    { label: "Traités", value: "345", change: "+12%", icon: CheckCircle, color: "purple", link: "/courrier?status=traite" },
  ];

  const courriers = [
    { id: "#COU-001", type: "Entrant", sender: "Ministère Intérieur", subject: "Convention de partenariat", date: "15/06/2026", status: "Validé", priority: "Haute" },
    { id: "#COU-002", type: "Sortant", sender: "Mairie de Sédhiou", subject: "Demande de subvention", date: "14/06/2026", status: "En attente", priority: "Moyenne" },
    { id: "#COU-003", type: "Entrant", sender: "Préfecture", subject: "Notification de nomination", date: "13/06/2026", status: "Validé", priority: "Urgente" },
    { id: "#COU-004", type: "Sortant", sender: "Service État Civil", subject: "Rapport mensuel", date: "12/06/2026", status: "Rejeté", priority: "Basse" },
    { id: "#COU-005", type: "Entrant", sender: "Ministère Santé", subject: "Campagne de vaccination", date: "11/06/2026", status: "En attente", priority: "Haute" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Validé": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "Rejeté": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "En attente": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">?? Courrier</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion complète du courrier</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/courrier/nouveau" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nouveau courrier
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
              placeholder="Rechercher par expéditeur, objet, numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-modern w-full md:w-40"
          >
            <option value="all">Tous les types</option>
            <option value="entrant">Entrant</option>
            <option value="sortant">Sortant</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-modern w-full md:w-40"
          >
            <option value="all">Tous les statuts</option>
            <option value="valide">Validé</option>
            <option value="attente">En attente</option>
            <option value="rejete">Rejeté</option>
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

      {/* Liste des courriers */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">?? Courriers récents</h3>
          <div className="flex gap-2">
            <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">N° Courrier</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Expéditeur</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Objet</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Priorité</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courriers.map((courrier, index) => (
                <motion.tr
                  key={courrier.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{courrier.id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      courrier.type === "Entrant" 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    }`}>
                      {courrier.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-gray-200">{courrier.sender}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{courrier.subject}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{courrier.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(courrier.priority)}`}>
                      {courrier.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(courrier.status)}`}>
                      {courrier.status === "Validé" ? <CheckCircle size={14} className="text-green-500" /> :
                       courrier.status === "Rejeté" ? <XCircle size={14} className="text-red-500" /> :
                       <Clock size={14} className="text-yellow-500" />}
                      {courrier.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/courrier/${courrier.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Voir">
                        <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                      <Link href={`/courrier/modifier/${courrier.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Modifier">
                        <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Télécharger" onClick={() => alert("?? Téléchargement en cours...")}>
                        <Download size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition" title="Supprimer" onClick={() => { if(confirm("Supprimer ce courrier ?")) alert("??? Courrier supprimé!") }}>
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

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/courrier/nouveau" className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
              <Plus size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Nouveau courrier</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Créer un courrier</p>
            </div>
          </div>
        </Link>
        <Link href="/courrier/entrant" className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 group-hover:scale-110 transition-transform">
              <Inbox size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Courrier entrant</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Consulter les entrées</p>
            </div>
          </div>
        </Link>
        <Link href="/courrier/sortant" className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20 group-hover:scale-110 transition-transform">
              <Send size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Courrier sortant</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Consulter les sorties</p>
            </div>
          </div>
        </Link>
        <Link href="/documents/archives" className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform">
              <Archive size={24} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Archives</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Courriers archivés</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
