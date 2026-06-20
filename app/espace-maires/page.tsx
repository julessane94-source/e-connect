"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Award, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  Quote, 
  Star, 
  ArrowRight,
  User,
  Clock,
  Briefcase,
  GraduationCap,
  Heart,
  BookOpen,
  Trophy,
  Shield,
  UserCheck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Données des anciens maires
const maires = [
  {
    id: 1,
    name: "Cheikh Ahmed Diop",
    municipality: "Mairie de Dakar",
    term: "2014 - 2022",
    achievements: "12",
    bio: "Ancien maire de Dakar, pionnier de la digitalisation des services municipaux. Sous son mandat, la ville de Dakar a connu une transformation numérique majeure avec l'implémentation de plusieurs plateformes de services en ligne.",
    location: "Dakar, Sénégal",
    department: "Département de Dakar",
    image: "/images/maires/maire1.jpg",
    achievementsList: [
      { title: "Digitalisation des services", description: "Mise en place de la plateforme de services en ligne", date: "2020", icon: Globe },
      { title: "Modernisation administrative", description: "Dématérialisation des procédures municipales", date: "2019", icon: Building2 },
      { title: "Prix de l'innovation", description: "Reconnu pour l'innovation dans la gouvernance locale", date: "2021", icon: Trophy }
    ],
    testimonials: [
      { name: "Mme Aissatou Fall", role: "Citoyenne", content: "Un maire visionnaire qui a su moderniser notre ville." }
    ]
  },
  {
    id: 2,
    name: "Mamadou Lamine Ba",
    municipality: "Mairie de Thiès",
    term: "2016 - 2024",
    achievements: "8",
    bio: "Ancien maire de Thiès, engagé pour le développement durable et la participation citoyenne. Il a mis en place des programmes innovants pour améliorer la qualité de vie des habitants.",
    location: "Thiès, Sénégal",
    department: "Département de Thiès",
    image: "/images/maires/maire2.jpg",
    achievementsList: [
      { title: "Développement durable", description: "Programme de développement durable et de gestion des déchets", date: "2018", icon: Heart },
      { title: "Participation citoyenne", description: "Mise en place des conseils de quartier", date: "2017", icon: Users },
      { title: "Infrastructures modernes", description: "Construction de nouvelles infrastructures", date: "2019", icon: Building2 }
    ],
    testimonials: [
      { name: "M. Ousmane Sow", role: "Conseiller municipal", content: "Un leader exemplaire qui a su mobiliser toute la communauté." }
    ]
  },
  {
    id: 3,
    name: "Marie Ndiaye",
    municipality: "Mairie de Saint-Louis",
    term: "2018 - 2023",
    achievements: "10",
    bio: "Première femme maire de Saint-Louis, elle a marqué l'histoire de la ville par son engagement pour l'éducation et la culture. Elle a créé des centres culturels et soutenu les initiatives éducatives.",
    location: "Saint-Louis, Sénégal",
    department: "Département de Saint-Louis",
    image: "/images/maires/maire3.jpg",
    achievementsList: [
      { title: "Centres culturels", description: "Création de centres culturels dans les quartiers", date: "2019", icon: BookOpen },
      { title: "Éducation pour tous", description: "Programme de soutien à l'éducation", date: "2020", icon: GraduationCap },
      { title: "Égalité des genres", description: "Programme de promotion de l'égalité", date: "2021", icon: Users }
    ],
    testimonials: [
      { name: "M. Ibrahima Dia", role: "Habitant", content: "Une femme de cœur qui a transformé notre ville." }
    ]
  }
];

export default function EspaceMaires() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaire, setSelectedMaire] = useState<number | null>(null);
  const [filterMunicipality, setFilterMunicipality] = useState("all");

  const filteredMaires = maires.filter(maire => {
    const matchesSearch = maire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          maire.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          maire.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMunicipality === "all" || maire.department === filterMunicipality;
    return matchesSearch && matchesFilter;
  });

  const municipalities = [...new Set(maires.map(m => m.department))];

  return (
    <div className="min-h-screen py-16 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-4">
            🏛️ Anciens Maires
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Espace des <span className="gradient-text">Maires</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
            Découvrez les anciens maires qui ont marqué l'histoire de leurs communes
          </p>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">12</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Anciens maires</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">8</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Années d'expérience</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">150+</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Projets réalisés</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">98%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Satisfaction citoyenne</p>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un maire, une commune..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>
          <select
            value={filterMunicipality}
            onChange={(e) => setFilterMunicipality(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 dark:text-white"
          >
            <option value="all">Toutes les communes</option>
            {municipalities.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Liste des maires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredMaires.map((maire, index) => (
            <motion.div
              key={maire.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:border-green-300 dark:hover:border-green-700">
                {/* En-tête avec photo */}
                <div className="relative h-48 bg-gradient-to-br from-green-600 to-emerald-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-6xl">
                      {maire.name.charAt(0)}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-xl font-bold text-white">{maire.name}</h3>
                    <p className="text-green-200 text-sm">{maire.municipality}</p>
                  </div>
                </div>

                {/* Informations */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                      <Calendar size={12} />
                      {maire.term}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                      <Award size={12} />
                      {maire.achievements} réalisations
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {maire.bio}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin size={14} />
                      {maire.location}
                    </div>
                    <button
                      onClick={() => setSelectedMaire(selectedMaire === maire.id ? null : maire.id)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Voir plus
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal / Détails du maire */}
        {selectedMaire !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
            >
              {maires.filter(m => m.id === selectedMaire).map((maire) => (
                <div key={maire.id}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                        {maire.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{maire.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{maire.municipality}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMaire(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Biographie</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{maire.bio}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Informations</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar size={16} className="text-green-500" />
                          Mandat: {maire.term}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin size={16} className="text-green-500" />
                          {maire.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Building2 size={16} className="text-green-500" />
                          {maire.department}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Award size={16} className="text-green-500" />
                          {maire.achievements} réalisations
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Réalisations</h3>
                      <div className="space-y-3">
                        {maire.achievementsList.map((achievement, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                              <achievement.icon size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{achievement.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{achievement.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Témoignages</h3>
                      <div className="space-y-3">
                        {maire.testimonials.map((testimonial, index) => (
                          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="flex items-start gap-3">
                              <Quote size={20} className="text-green-500 flex-shrink-0" />
                              <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{testimonial.content}"</p>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                                {testimonial.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMaire(null)}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition"
                  >
                    Fermer
                  </button>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
