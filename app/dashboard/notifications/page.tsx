"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Bell, Check, X, Clock, MessageSquare, FileText } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nouveau message de M. Diop", message: "Bonjour, j'ai une question concernant le dossier #2026-001", time: "Il y a 5 minutes", type: "message", read: false },
    { id: 2, title: "Document à signer: Convention #2026-12", message: "Le document nécessite votre signature électronique", time: "Il y a 30 minutes", type: "document", read: false },
    { id: 3, title: "Tâche en retard: Rapport mensuel", message: "La tâche est en retard de 2 jours", time: "Il y a 2 heures", type: "task", read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">?? Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{unreadCount} non lues</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary flex items-center gap-2">
            <Check size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`card-modern p-4 hover:border-green-300 dark:hover:border-green-700 ${!notif.read ? 'border-green-200 dark:border-green-800' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl ${!notif.read ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {notif.type === "message" ? <MessageSquare size={16} className="text-blue-500" /> : <FileText size={16} className="text-purple-500" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{notif.title}</h4>
                  {!notif.read && (
                    <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">Nouveau</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
              </div>
              {!notif.read && (
                <button 
                  onClick={() => markAsRead(notif.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Check size={16} className="text-green-500" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
