"use client";

import { motion } from "framer-motion";
import { Shield, Plus, Edit, Trash2, ChevronLeft, Check, X } from "lucide-react";
import Link from "next/link";

export default function Roles() {
  const roles = [
    { name: "Administrateur", permissions: ["ALL"], users: 1 },
    { name: "Secrétaire", permissions: ["READ", "WRITE"], users: 3 },
    { name: "Agent", permissions: ["READ"], users: 5 },
    { name: "Auditeur", permissions: ["READ"], users: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/parametres" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔐 Rôles</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion des rôles et permissions</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nouveau rôle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roles.map((role, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                  <Shield size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{role.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{role.users} utilisateurs</span>
                    <span>•</span>
                    <span>{role.permissions.join(", ")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
