"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Edit, Trash2, ChevronLeft, Shield, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function Utilisateurs() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const users = [
    { name: "Admin", email: "admin@agent-connect.sn", role: "Administrateur", status: "Actif" },
    { name: "Marie Diouf", email: "marie@agent-connect.sn", role: "Secrétaire", status: "Actif" },
    { name: "Aliou Sow", email: "aliou@agent-connect.sn", role: "Agent", status: "Inactif" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/parametres" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">👤 Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion des utilisateurs</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-10"
            />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{user.role}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === "Actif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition">
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
    </div>
  );
}
