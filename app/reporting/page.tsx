"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, Calendar, ChevronLeft, FileText, TrendingUp, Users, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function Reporting() {
  const [period, setPeriod] = useState("month");

  const stats = [
    { label: "Actes générés", value: "1,234", change: "+12%", icon: FileText },
    { label: "Demandes traitées", value: "567", change: "+8%", icon: Users },
    { label: "Taux de satisfaction", value: "94%", change: "+5%", icon: TrendingUp },
  ];

  const reports = [
    { name: "Rapport mensuel - Juin 2024", date: "30/06/2024", type: "PDF", size: "2.4 MB" },
    { name: "Rapport trimestriel - Q2 2024", date: "30/06/2024", type: "PDF", size: "5.1 MB" },
    { name: "Statistiques annuelles 2023", date: "31/12/2023", type: "EXCEL", size: "8.7 MB" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Reporting</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Rapports et statistiques</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex items-center gap-2">
            <FileSpreadsheet size={18} />
            Générer rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="card-modern p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change} ce mois</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <stat.icon size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card-modern p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Rapports disponibles</h3>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-modern w-40"
            >
              <option value="month">Mensuel</option>
              <option value="quarter">Trimestriel</option>
              <option value="year">Annuel</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                  <FileText size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{report.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {report.date}
                    </span>
                    <span>•</span>
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary flex items-center gap-2">
                <Download size={16} />
                Télécharger
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
