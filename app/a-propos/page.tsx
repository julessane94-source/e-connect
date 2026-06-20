"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Award, 
  Heart, 
  Target, 
  Eye, 
  Lightbulb,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function APropos() {
  const values = [
    {
      icon: Target,
      title: "Notre Mission",
      description: "Digitaliser les services municipaux pour une administration plus efficace et transparente."
    },
    {
      icon: Eye,
      title: "Notre Vision",
      description: "Devenir la plateforme de référence pour la gestion municipale en Afrique francophone."
    },
    {
      icon: Lightbulb,
      title: "Nos Valeurs",
      description: "Innovation, Transparence, Efficacité et Service au citoyen."
    }
  ];

  const stats = [
    { value: "50+", label: "Mairies partenaires" },
    { value: "10K+", label: "Actes traités" },
    { value: "98%", label: "Satisfaction" },
    { value: "24/7", label: "Support disponible" }
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
            À <span className="gradient-text">Propos</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
            Découvrez qui nous sommes et ce qui nous motive
          </p>
        </motion.div>

        {/* Valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <value.icon size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Statistiques */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-12 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-green-100 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Équipe */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Une équipe <span className="gradient-text">passionnée</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Nous sommes une équipe de développeurs, designers et experts en administration
            publique unis par une même passion : la modernisation des services municipaux.
          </p>
          <Link
            href="/nos-services"
            className="inline-flex items-center gap-2 mt-6 text-green-600 dark:text-green-400 font-medium hover:gap-3 transition-all"
          >
            Découvrir nos services
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
