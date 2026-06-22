"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search, Clock, CheckCircle, AlertCircle, Users, Calendar, Edit, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuiviTaches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  const tasks = [
    { 
      id: 1,
      title: "Rapport mensuel d'activité", 
      assignee: "Admin", 
      dueDate: "25/06/2026", 
      status: "En cours", 
      progress: 60,
      description: "Préparer le rapport mensuel pour le ministère",
      subtasks: [
        { title: "Collecter les données", done: true },
        { title: "Analyser les statistiques", done: true },
        { title: "Rédiger le rapport", done: false },
        { title: "Faire valider", done: false }
      ]
    },
    { 
      id: 2,
      title: "Validation des actes d'état civil", 
      assignee: "Marie Diouf", 
      dueDate: "20/06/2026", 
      status: "En retard", 
      progress: 30,
      description: "Valider les actes en attente",
      subtasks: [
        { title: "Vérifier les documents", done: true },
        { title: "Valider les actes", done: false },
        { title: "Archiver les documents", done: false }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Terminée": return "bg-green-100 text-green-700";
      case "En cours": return "bg-blue-100 text-blue-700";
      case "En retard": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Terminée": return <CheckCircle size={16} className="text-green-500" />;
      case "En cours": return <Clock size={16} className="text-blue-500" />;
      case "En retard": return <AlertCircle size={16} className="text-red-500" />;
      default: return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  const handleEdit = (id: number) => {
    alert(`?? Modification de la tâche ${id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm(`??? Supprimer la tâche ${id} ?`)) {
      alert(`??? Tâche ${id} supprimée`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/taches" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">?? Suivi des tâches</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Suivi en temps réel des tâches</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex gap-4">
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
          <button className="btn-primary flex items-center gap-2">
            <Search size={18} />
            Rechercher
          </button>
        </div>
      </div>

      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  {task.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {task.assignee}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Échéance: {task.dueDate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(task.id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Edit size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => handleDelete(task.id)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
              <button 
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <ArrowRight size={16} className={`text-gray-600 dark:text-gray-400 transition-transform ${selectedTask === task.id ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* Progression */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progression</span>
              <span>{task.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${
                  task.progress === 100 ? "bg-green-500" :
                  task.progress > 50 ? "bg-blue-500" :
                  "bg-yellow-500"
                }`}
              />
            </div>
          </div>

          {/* Détails supplémentaires */}
          {selectedTask === task.id && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Description</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Sous-tâches</h5>
                  <div className="space-y-1 mt-1">
                    {task.subtasks.map((sub, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input type="checkbox" checked={sub.done} onChange={() => {}} className="w-4 h-4 rounded border-gray-300 text-green-600" />
                        <span className={sub.done ? "line-through text-gray-400" : ""}>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
