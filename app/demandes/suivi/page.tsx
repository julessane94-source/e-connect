"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search, Eye, Clock, CheckCircle, XCircle, AlertCircle, Calendar, User } from "lucide-react";
import Link from "next/link";

export default function SuiviDemandes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDemand, setSelectedDemand] = useState<number | null>(null);

  const demands = [
    { 
      id: 1, 
      number: "#DEM-001", 
      type: "Certificat de naissance", 
      citizen: "Marie Diouf", 
      date: "15/06/2024", 
      status: "En attente", 
      step: 2,
      history: [
        { date: "15/06/2024 10:30", action: "Dépôt de la demande", user: "Marie Diouf" },
        { date: "15/06/2024 11:00", action: "Vérification des documents", user: "Agent" }
      ]
    },
    { 
      id: 2, 
      number: "#DEM-002", 
      type: "Extrait de mariage", 
      citizen: "Aliou Sow", 
      date: "14/06/2024", 
      status: "Validée", 
      step: 4,
      history: [
        { date: "14/06/2024 09:00", action: "Dépôt de la demande", user: "Aliou Sow" },
        { date: "14/06/2024 09:30", action: "Vérification des documents", user: "Agent" },
        { date: "14/06/2024 10:00", action: "Validation par le chef", user: "Chef de service" },
        { date: "14/06/2024 11:00", action: "Demande approuvée", user: "Système" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Validée": return <CheckCircle size={16} className="text-green-500" />;
      case "Rejetée": return <XCircle size={16} className="text-red-500" />;
      case "En cours": return <Clock size={16} className="text-blue-500" />;
      default: return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  const getSteps = (currentStep: number) => {
    const steps = ["Dépôt", "Vérification", "Validation", "Approbation", "Terminé"];
    return steps.map((step, index) => ({
      label: step,
      completed: index < currentStep,
      current: index === currentStep - 1
    }));
  };

  const handleValidate = (id: number) => {
    alert(`✅ Demande ${id} validée avec succès !`);
  };

  const handleReject = (id: number) => {
    if (confirm(`❌ Confirmer le rejet de la demande ${id} ?`)) {
      alert(`❌ Demande ${id} rejetée.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/demandes" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔍 Suivi des demandes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Suivi en temps réel des demandes citoyennes</p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Numéro de demande, nom..."
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

      {demands.map((demand) => (
        <motion.div
          key={demand.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-modern p-6 hover:border-green-300 dark:hover:border-green-700"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{demand.number}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                  demand.status === "Validée" ? "bg-green-100 text-green-700" :
                  demand.status === "Rejetée" ? "bg-red-100 text-red-700" :
                  demand.status === "En cours" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {getStatusIcon(demand.status)}
                  {demand.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {demand.type} - {demand.citizen} - {demand.date}
              </p>
            </div>
            <div className="flex gap-2">
              {demand.status === "En attente" && (
                <>
                  <button 
                    onClick={() => handleValidate(demand.id)}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <CheckCircle size={16} />
                    Valider
                  </button>
                  <button 
                    onClick={() => handleReject(demand.id)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <XCircle size={16} />
                    Rejeter
                  </button>
                </>
              )}
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <Eye size={16} />
                Détails
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {getSteps(demand.step).map((step, idx) => (
                <div key={idx} className="flex items-center">
                  <div className={`flex items-center gap-2 ${step.completed ? "text-green-600" : "text-gray-400"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.completed ? "bg-green-500 text-white" :
                      step.current ? "bg-blue-500 text-white" :
                      "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-xs hidden sm:inline">{step.label}</span>
                  </div>
                  {idx < getSteps(demand.step).length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-2 ${
                      step.completed ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Historique */}
          {selectedDemand === demand.id && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Historique</h5>
              <div className="space-y-2">
                {demand.history.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
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
