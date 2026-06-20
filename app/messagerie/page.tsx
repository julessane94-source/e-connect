"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  MessageCircle, 
  Search, 
  Send, 
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Users,
  Plus,
  Settings,
  User,
  Clock,
  Check,
  CheckCheck,
  Image,
  File,
  Mic
} from "lucide-react";

export default function Messagerie() {
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(0);

  const conversations = [
    { id: 0, name: "Moussa Diop", lastMessage: "Bonjour, comment ça va ?", time: "12:30", unread: 3, online: true, avatar: "M", color: "blue" },
    { id: 1, name: "Aissatou Sow", lastMessage: "Je vous envoie le document", time: "11:45", unread: 0, online: false, avatar: "A", color: "green" },
    { id: 2, name: "Ibrahim Ndiaye", lastMessage: "Merci pour votre aide", time: "10:20", unread: 2, online: true, avatar: "I", color: "purple" },
    { id: 3, name: "Fatou Diouf", lastMessage: "Je confirme ma présence", time: "09:15", unread: 0, online: false, avatar: "F", color: "orange" },
    { id: 4, name: "Groupe Direction", lastMessage: "Réunion à 14h", time: "08:45", unread: 5, online: false, avatar: "G", color: "red" },
  ];

  const messages = [
    { sender: "Moussa Diop", message: "Bonjour, comment ça va ?", time: "12:30", sent: false, read: true },
    { sender: "Moi", message: "Très bien, merci ! Et vous ?", time: "12:31", sent: true, read: true },
    { sender: "Moussa Diop", message: "Je vais bien aussi. J'ai une question concernant le dossier.", time: "12:32", sent: false, read: true },
    { sender: "Moi", message: "Oui, je vous écoute.", time: "12:33", sent: true, read: true },
    { sender: "Moussa Diop", message: "Pouvez-vous m'envoyer le formulaire ?", time: "12:34", sent: false, read: false },
    { sender: "Moi", message: "Je vous l'envoie tout de suite.", time: "12:35", sent: true, read: false },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      alert(`✅ Message envoyé: "${message}"`);
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💬 Messagerie</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Communication interne</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/messagerie/groupes" className="btn-secondary flex items-center gap-2">
            <Users size={18} />
            Nouveau groupe
          </Link>
          <Link href="/messagerie/canaux" className="btn-secondary flex items-center gap-2">
            <Plus size={18} />
            Créer un canal
          </Link>
          <button className="btn-secondary flex items-center gap-2" onClick={() => alert("⚙️ Paramètres de messagerie")}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des conversations */}
        <div className="card-modern p-4 lg:col-span-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="input-modern w-full pl-10"
            />
          </div>
          <div className="space-y-2 overflow-y-auto max-h-[600px]">
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + conv.id * 0.05 }}
                onClick={() => setSelectedChat(conv.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer ${
                  selectedChat === conv.id 
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full bg-${conv.color}-500 flex items-center justify-center text-white font-bold text-lg`}>
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white">{conv.name}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{conv.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">{conv.unread}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fenêtre de chat */}
        <div className="lg:col-span-2 card-modern p-4 flex flex-col h-[600px]">
          {/* En-tête du chat */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {conversations[selectedChat]?.avatar || "M"}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{conversations[selectedChat]?.name || "Moussa Diop"}</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  {conversations[selectedChat]?.online ? "En ligne" : "Dernière connexion il y a 2h"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Appel audio">
                <Phone size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Appel vidéo">
                <Video size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Plus d'options">
                <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${
                  msg.sent 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  } rounded-2xl px-4 py-2.5`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    msg.sent ? "text-green-200" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    <span className="text-xs">{msg.time}</span>
                    {msg.sent && (
                      msg.read ? <CheckCheck size={14} /> : <Check size={14} />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Zone de saisie */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Joindre un fichier">
                <Paperclip size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Image">
                <Image size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Fichier">
                <File size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <input
                type="text"
                placeholder="Écrire un message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-modern flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && message.trim()) {
                    handleSendMessage();
                  }
                }}
              />
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Micro">
                <Mic size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                className={`p-3 rounded-xl transition ${
                  message.trim() 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
