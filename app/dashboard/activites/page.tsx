"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Search, Eye, Calendar, User } from "lucide-react";

export default function Activites() {
  const [searchTerm, setSearchTerm] = useState("");

  const activities = [
    { title: "Nouveau certificat de naissance #2026-001", user: "Moussa Diop", date: "15/06/2026 10:30", type: "création", icon: "??" },
    { title: "Demande citoyenne validée - Marie Diouf", user: "Aissatou Sow", date: "15/06/2026 09:15", type: "validation", icon: "?" },
    { title: "Nouveau courrier entrant #2026-045", user: "Ministère Intérieur", date: "14/06/2026 16:45", type: "courrier", icon: "??" },
    { title: "Rapport mensuel généré", user: "Système", date: "14/06/2026 14:00", type: "rapport", icon: "??" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">?? Activités récentes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Historique complet des activités</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une activité..."
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

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="card-modern p-4 hover:border-green-300 dark:hover:border-green-700"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {activity.user}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {activity.date}
                  </span>
                  <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {activity.type}
                  </span>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Eye size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
