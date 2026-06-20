"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, XCircle, Users, Calendar, Clock, Flag, Tag, Edit } from "lucide-react";
import Link from "next/link";

export default function NouvelleTache() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "moyenne",
    dueDate: "",
    status: "a-faire",
    category: "",
    tags: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/taches");
      }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/taches" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">✅ Nouvelle tâche</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Créer une nouvelle tâche</p>
        </div>
      </div>

      {success ? (
        <div className="card-modern p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tâche créée avec succès !</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Redirection vers la liste des tâches...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-modern p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Titre de la tâche *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Rapport mensuel"
                className="input-modern w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez la tâche..."
                className="input-modern w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Users size={16} className="inline mr-1" />
                  Assigné à *
                </label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="input-modern w-full"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="Admin">Admin</option>
                  <option value="Marie Diouf">Marie Diouf</option>
                  <option value="Aliou Sow">Aliou Sow</option>
                  <option value="Fatou Ndiaye">Fatou Ndiaye</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Flag size={16} className="inline mr-1" />
                  Priorité
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-modern w-full"
                >
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Tag size={16} className="inline mr-1" />
                  Catégorie
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-modern w-full"
                >
                  <option value="">Sélectionner</option>
                  <option value="rapport">Rapport</option>
                  <option value="validation">Validation</option>
                  <option value="documentation">Documentation</option>
                  <option value="reunion">Réunion</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Calendar size={16} className="inline mr-1" />
                  Date d'échéance *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="input-modern w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Clock size={16} className="inline mr-1" />
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-modern w-full"
                >
                  <option value="a-faire">À faire</option>
                  <option value="en-cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Edit size={16} className="inline mr-1" />
                Mots-clés (séparés par des virgules)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="urgent, important, document"
                className="input-modern w-full"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Créer la tâche
                </>
              )}
            </button>
            <button type="reset" className="btn-secondary flex items-center gap-2">
              <XCircle size={18} />
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
