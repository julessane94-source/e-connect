"use client";

import { motion, useReducedMotion } from "framer-motion";
import { 
  FileText, 
  Mail, 
  CheckSquare, 
  BarChart3, 
  MessageSquare, 
  Users,
  Shield,
  Clock,
  Award,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function NosServices() {
  const reduceMotion = useReducedMotion();
  const services = [
    {
      icon: FileText,
      title: "État Civil Numérique",
      description: "Gestion complète des actes de naissance, mariage et décès avec génération automatique de documents.",
      features: ["Actes numérisés", "Génération PDF", "QR Code", "Recherche avancée"],
      color: "blue"
    },
    {
      icon: Mail,
      title: "Gestion du Courrier",
      description: "Suivi et archivage numérique du courrier entrant et sortant.",
      features: ["Courrier entrant", "Courrier sortant", "Archivage", "Signature électronique"],
      color: "green"
    },
    {
      icon: CheckSquare,
      title: "Gestion des Tâches",
      description: "Planification et suivi des activités municipales avec priorités et échéances.",
      features: ["Assignation", "Suivi en temps réel", "Priorités", "Notifications"],
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Reporting & Statistiques",
      description: "Tableaux de bord et rapports pour une prise de décision éclairée.",
      features: ["Statistiques en temps réel", "Rapports PDF", "Export Excel", "Indicateurs clés"],
      color: "orange"
    },
    {
      icon: MessageSquare,
      title: "Messagerie Interne",
      description: "Communication fluide entre les agents municipaux.",
      features: ["Chat instantané", "Groupes de discussion", "Partage de fichiers", "Notifications"],
      color: "pink"
    },
    {
      icon: Users,
      title: "Espace Citoyens",
      description: "Portail pour les citoyens pour effectuer leurs démarches en ligne.",
      features: ["Dépôt de demandes", "Suivi en ligne", "Paiement sécurisé", "Notifications"],
      color: "teal"
    }
  ];

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Nos <span className="gradient-text">Services</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-base sm:mt-4 sm:text-lg">
            Découvrez l'ensemble des solutions proposées par Sedhiou-connect
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.07, 0.28), duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.12 }}
              className="group bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-${service.color}-100 dark:bg-${service.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <service.icon size={28} className={`text-${service.color}-600 dark:text-${service.color}-400`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {service.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                {service.description}
              </p>
              <ul className="mt-4 space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 mt-6 text-green-600 dark:text-green-400 font-medium hover:gap-3 transition-all"
              >
                En savoir plus
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
