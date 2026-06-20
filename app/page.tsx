"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  Shield,
  Award,
  Clock,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

export default function Home() {
  const stats = [
    { value: "500+", label: "Agents formés", icon: Users },
    { value: "50+", label: "Mairies partenaires", icon: Building2 },
    { value: "10K+", label: "Actes traités", icon: FileText },
    { value: "98%", label: "Satisfaction", icon: CheckCircle },
  ];

  const services = [
    {
      title: "État Civil",
      description: "Gestion numérique des actes de naissance, mariage et décès",
      icon: FileText,
      color: "blue"
    },
    {
      title: "Courrier",
      description: "Suivi et archivage numérique du courrier municipal",
      icon: Mail,
      color: "green"
    },
    {
      title: "Gestion des tâches",
      description: "Planification et suivi des activités municipales",
      icon: CheckCircle,
      color: "purple"
    },
    {
      title: "Reporting",
      description: "Statistiques et rapports en temps réel",
      icon: Calendar,
      color: "orange"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950"></div>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 dark:bg-green-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 dark:bg-emerald-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "2s" }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 dark:bg-teal-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "4s" }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                🚀 Plateforme officielle
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Digitalisez vos<br />
                services <span className="gradient-text">municipaux</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-6 max-w-2xl leading-relaxed">
                Une plateforme moderne pour simplifier la gestion administrative 
                des mairies au Sénégal
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/auth/login"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Commencer maintenant
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/nos-services"
                  className="px-8 py-3 bg-white/80 dark:bg-gray-800 text-gray-700 dark:text-white rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-600"
                >
                  Découvrir
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <stat.icon size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Nos <span className="gradient-text">Services</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Des solutions adaptées aux besoins des collectivités territoriales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon size={24} className={`text-${service.color}-600 dark:text-${service.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Prêt à digitaliser votre mairie ?
            </h2>
            <p className="text-green-100 text-lg max-w-2xl mx-auto mb-8">
              Rejoignez plus de 50 mairies qui ont déjà adopté Agent Connect
            </p>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white text-green-600 rounded-xl font-medium hover:bg-gray-100 transition shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              Commencer maintenant
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
