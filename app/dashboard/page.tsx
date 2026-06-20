"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Calendar,
  ArrowRight,
  BarChart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Printer,
  Download,
  Bell,
  Activity,
  PieChart,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const stats = [
    { 
      label: "Actes d'état civil", 
      value: "1,234", 
      change: "+12%", 
      trend: "up", 
      icon: FileText, 
      color: "green", 
      link: "/etat-civil",
      description: "Actes enregistrés ce mois"
    },
    { 
      label: "Demandes citoyennes", 
      value: "567", 
      change: "+8%", 
      trend: "up", 
      icon: Users, 
      color: "emerald", 
      link: "/demandes",
      description: "Demandes en attente: 45"
    },
    { 
      label: "Tâches en cours", 
      value: "89", 
      change: "-3%", 
      trend: "down", 
      icon: Clock, 
      color: "yellow", 
      link: "/taches",
      description: "5 tâches en retard"
    },
    { 
      label: "Messages non lus", 
      value: "45", 
      change: "+15%", 
      trend: "up", 
      icon: MessageSquare, 
      color: "teal", 
      link: "/messagerie",
      description: "12 nouveaux messages"
    },
  ];

  const quickActions = [
    { icon: Plus, label: "Nouvel acte", color: "green", link: "/etat-civil/naissances/nouvelle" },
    { icon: FileText, label: "Générer document", color: "blue", link: "/documents/generation" },
    { icon: Users, label: "Nouvelle demande", color: "purple", link: "/demandes/nouvelle" },
    { icon: Calendar, label: "Calendrier", color: "orange", link: "/calendrier" },
  ];

  const recentActivities = [
    { title: "Nouveau certificat de naissance #2024-001", time: "Il y a 2 minutes", icon: "📄", link: "/etat-civil/naissances" },
    { title: "Demande citoyenne validée - Marie Diouf", time: "Il y a 15 minutes", icon: "✅", link: "/demandes" },
    { title: "Nouveau courrier entrant #2024-045", time: "Il y a 1 heure", icon: "📧", link: "/courrier" },
    { title: "Rapport mensuel généré", time: "Il y a 2 heures", icon: "📊", link: "/reporting" },
  ];

  const notifications = [
    { title: "Nouveau message de M. Diop", time: "Il y a 5 minutes", icon: "💬", link: "/messagerie" },
    { title: "Document à signer: Convention #2024-12", time: "Il y a 30 minutes", icon: "📄", link: "/documents" },
    { title: "Tâche en retard: Rapport mensuel", time: "Il y a 2 heures", icon: "⚠️", link: "/taches" },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête avec bienvenue */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Bonjour, Admin 👋
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Voici ce qui se passe aujourd'hui dans votre service
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/calendrier" className="btn-primary flex items-center gap-2">
            <Calendar size={18} />
            <span>Voir calendrier</span>
          </Link>
          <Link href="/reporting" className="btn-secondary flex items-center gap-2">
            <BarChart size={18} />
            <span>Rapports</span>
          </Link>
        </div>
      </div>

      {/* Statistiques - Chaque carte est cliquable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push(stat.link)}
            className="card-modern p-6 cursor-pointer hover:border-green-300 dark:hover:border-green-700 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}>
                  {stat.trend === "up" ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                  {stat.change} ce mois
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} strokeWidth={1.8} className={`text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions rapides */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚡ Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={action.link}
                className={`card-modern p-6 text-center hover:border-${action.color}-300 dark:hover:border-${action.color}-700 cursor-pointer block`}
              >
                <div className={`p-3 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/20 inline-block`}>
                  <action.icon size={24} className={`text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                <p className="font-medium text-gray-900 dark:text-white mt-3 text-sm">{action.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activités récentes et Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-modern p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Activités récentes</h3>
              <Link href="/dashboard/activites" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 group">
                Voir tout 
                <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => router.push(activity.link)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer group"
                >
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Notifications */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-modern p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🔔 Notifications</h3>
              <div className="flex items-center gap-2">
                <span className="badge badge-red font-semibold">3</span>
                <Link href="/dashboard/notifications" className="text-xs text-green-600 hover:text-green-700">
                  Tout voir
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {notifications.map((notif, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => router.push(notif.link)}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <span className="text-2xl">{notif.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link href="/dashboard/notifications" className="mt-4 w-full text-center text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 transition py-2 border-t border-gray-200 dark:border-gray-700 pt-4 block">
              Voir toutes les notifications →
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Pied de page avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-modern p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
            <UserCheck size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Utilisateurs actifs</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">12</p>
          </div>
        </div>
        <div className="card-modern p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
            <Activity size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Taux d'activité</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">94%</p>
          </div>
        </div>
        <div className="card-modern p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/20">
            <PieChart size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tâches terminées</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">156</p>
          </div>
        </div>
      </div>
    </div>
  );
}
