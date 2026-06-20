"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search, Eye, CheckCircle, XCircle, Clock, Download, Printer, Mail, User, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuiviCourrier() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourrier, setSelectedCourrier] = useState<string | null>(null);

  const courriers = [
    { 
      id: "#COU-001", 
      type: "Entrant", 
      sender: "Ministère Intérieur", 
      subject: "Convention de partenariat", 
      date: "15/06/2024", 
      status: "Traité",
      response: "Accepté",
      history: [
        { date: "15/06/2024 10:00", action: "Réception du courrier", user: "Service Courrier" },
        { date: "15/06/2024 14:00", action: "Transmission au chef", user: "Service Courrier" },
        { date: "15/06/2024 16:00", action: "Validation", user: "Chef de service" }
      ]
    },
    { 
      id: "#COU-002", 
      type: "Sortant", 
      sender: "Mairie de Dakar", 
      subject: "Demande de subvention", 
      date: "14/06/2024", 
      status: "En attente",
      response: "-",
      history: [
        { date: "14/06/2024 09:00", action: "Création du courrier", user: "Service Courrier" },
        { date: "14/06/2024 11:00", action: "Validation en cours", user: "Chef de service" }
      ]
    },
    { 
      id: "#COU-003", 
      type: "Entrant", 
      sender: "Préfecture", 
      subject: "Notification de nomination", 
      date: "13/06/2024", 
      status: "Traité",
      response: "Approuvé",
      history: [
        { date: "13/06/2024 08:00", action: "Réception du courrier", user: "Service Courrier" },
        { date: "13/06/2024 10:00", action: "Transmission au chef", user: "Service Courrier" },
        { date: "13/06/2024 12:00", action: "Validation", user: "Chef de service" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Traité": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "En attente": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Rejeté": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Traité": return <CheckCircle size={14} className="text-green-500" />;
      case "En attente": return <Clock size={14} className="text-yellow-500" />;
      case "Rejeté": return <XCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-gray-500" />;
    }
  };

  const handleValidate = (id: string) => {
    alert(`✅ Courrier ${id} validé avec succès !`);
  };

  const handleReject = (id: string) => {
    if (confirm(`❌ Confirmer le rejet du courrier ${id} ?`)) {
      alert(`❌ Courrier ${id} rejeté.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/courrier" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📧 Suivi du courrier</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Suivi en temps réel du courrier</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par numéro, expéditeur, objet..."
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

      {courriers.map((courrier) => (
        <motion.div
          key={courrier.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{courrier.id}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(courrier.status)}`}>
                  {getStatusIcon(courrier.status)}
                  {courrier.status}
                </span>
                {courrier.response !== "-" && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Réponse: {courrier.response}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span className="font-medium">{courrier.type}</span> - {courrier.sender} - {courrier.subject}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} className="inline mr-1" />
                {courrier.date}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {courrier.status === "En attente" && (
                <>
                  <button 
                    onClick={() => handleValidate(courrier.id)}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <CheckCircle size={16} />
                    Valider
                  </button>
                  <button 
                    onClick={() => handleReject(courrier.id)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <XCircle size={16} />
                    Rejeter
                  </button>
                </>
              )}
              <button className="btn-secondary flex items-center gap-2 text-sm" onClick={() => alert(`📄 Aperçu de ${courrier.id}`)}>
                <Eye size={16} />
                Voir
              </button>
              {courrier.status === "Traité" && (
                <button className="btn-secondary flex items-center gap-2 text-sm" onClick={() => alert(`⬇️ Téléchargement de ${courrier.id}`)}>
                  <Download size={16} />
                  Télécharger
                </button>
              )}
              <button 
                onClick={() => setSelectedCourrier(selectedCourrier === courrier.id ? null : courrier.id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <ArrowRight size={16} className={`text-gray-600 dark:text-gray-400 transition-transform ${selectedCourrier === courrier.id ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {selectedCourrier === courrier.id && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Historique du traitement</h5>
              <div className="space-y-2">
                {courrier.history.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.action}</span>
                    <span className="text-gray-400">par {item.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
