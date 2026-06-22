"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Building2, Award, BookOpen } from "lucide-react";

export default function Historique() {
  const timeline = [
    {
      year: "2020",
      title: "Lancement du projet",
      description: "Début de la réflexion sur la digitalisation des services municipaux à Sédhiou",
      icon: BookOpen
    },
    {
      year: "2021",
      title: "Phase pilote",
      description: "Premier cadrage territorial avec les communes de la région de Sédhiou",
      icon: Users
    },
    {
      year: "2022",
      title: "Expansion",
      description: "Extension progressive aux communes de Bounkiling, Goudomp et Sédhiou",
      icon: Building2
    },
    {
      year: "2023",
      title: "Reconnaissance nationale",
      description: "Adoption par le Ministère de l'Intérieur comme plateforme de référence",
      icon: Award
    },
    {
      year: "2026",
      title: "Version 2.0",
      description: "Lancement de la nouvelle version avec messagerie et reporting avancé",
      icon: Calendar
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Notre <span className="gradient-text">Histoire</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
            Découvrez le parcours d'Agent Connect, la plateforme qui révolutionne
            la gestion municipale à Sédhiou
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-green-400 to-emerald-500"></div>

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                <div className="w-1/2 pr-8 text-right">
                  <div className={`${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {item.year}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 z-10">
                  <item.icon size={20} className="text-white" />
                </div>

                <div className="w-1/2 pl-8"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
