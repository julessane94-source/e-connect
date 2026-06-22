"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Edit,
  Trash2,
  Filter,
  Download,
  Printer,
  ArrowRight,
  UserCheck,
  BarChart3,
  Eye,
  Flag,
  List,
  LayoutGrid
} from "lucide-react";

export default function Taches() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [filterPriority, setFilterPriority] = useState("all");

  const stats = [
    { label: "À faire", value: "12", change: "+3", icon: Clock, color: "yellow", link: "/taches?status=faire" },
    { label: "En cours", value: "8", change: "+2", icon: AlertCircle, color: "blue", link: "/taches?status=cours" },
    { label: "Terminées", value: "34", change: "+8", icon: CheckCircle, color: "green", link: "/taches?status=termine" },
    { label: "En retard", value: "5", change: "-2", icon: AlertCircle, color: "red", link: "/taches?status=retard" },
  ];

  const tasks = [
    { id: 1, title: "Rapport mensuel d'activité", assignee: "Admin", dueDate: "25/06/2026", priority: "Haute", status: "En cours", progress: 60, category: "Rapport" },
    { id: 2, title: "Validation des actes d'état civil", assignee: "Marie Diouf", dueDate: "20/06/2026", priority: "Moyenne", status: "En retard", progress: 30, category: "Validation" },
    { id: 3, title: "Mise à jour des documents", assignee: "Aliou Sow", dueDate: "30/06/2026", priority: "Basse", status: "À faire", progress: 0, category: "Documentation" },
    { id: 4, title: "Rapport trimestriel", assignee: "Fatou Ndiaye", dueDate: "15/06/2026", priority: "Haute", status: "Terminée", progress: 100, category: "Rapport" },
    { id: 5, title: "Réunion d'équipe", assignee: "Admin", dueDate: "22/06/2026", priority: "Moyenne", status: "En cours", progress: 75, category: "Réunion" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Terminée": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "En cours": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "En retard": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Terminée": return <CheckCircle size={14} className="text-green-500" />;
      case "En cours": return <Clock size={14} className="text-blue-500" />;
      case "En retard": return <AlertCircle size={14} className="text-red-500" />;
      default: return <AlertCircle size={14} className="text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "Haute": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "Moyenne": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">? Tâches</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion complète des tâches</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/taches/nouvelle" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nouvelle tâche
          </Link>
          <Link href="/taches/kanban" className="btn-secondary flex items-center gap-2">
            <LayoutGrid size={18} />
            Kanban
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
              placeholder="Rechercher une tâche..."
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
            <option value="all">Tous les statuts</option>
            <option value="faire">À faire</option>
            <option value="cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="retard">En retard</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-modern w-full md:w-40"
          >
            <option value="all">Toutes les priorités</option>
            <option value="haute">Haute</option>
            <option value="moyenne">Moyenne</option>
            <option value="basse">Basse</option>
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
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      {viewMode === "list" ? (
        <div className="card-modern p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Tâche</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Assigné à</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Échéance</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Priorité</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Progression</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + task.id * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{task.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{task.assignee}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{task.dueDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${
                            task.progress === 100 ? "bg-green-500" :
                            task.progress > 50 ? "bg-blue-500" :
                            "bg-yellow-500"
                          }`} style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/taches/${task.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Voir">
                          <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                        </Link>
                        <Link href={`/taches/modifier/${task.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Modifier">
                          <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                        </Link>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Suivre" onClick={() => router.push("/taches/suivi")}>
                          <UserCheck size={16} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition" title="Supprimer" onClick={() => { if(confirm("Supprimer cette tâche ?")) alert("??? Tâche supprimée!") }}>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + task.id * 0.05 }}
              className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Users size={14} />
                      {task.assignee}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar size={14} />
                      {task.dueDate}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    task.progress === 100 ? "bg-green-500" :
                    task.progress > 50 ? "bg-blue-500" :
                    "bg-yellow-500"
                  }`} style={{ width: `${task.progress}%` }} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{task.progress}%</span>
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Voir">
                  <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Modifier">
                  <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition" title="Supprimer" onClick={() => { if(confirm("Supprimer cette tâche ?")) alert("??? Tâche supprimée!") }}>
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">Affichage 1-5 sur 89 tâches</p>
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
