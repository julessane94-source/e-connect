"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Plus } from "lucide-react";
import Link from "next/link";

export default function Calendrier() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const events = [
    { date: 15, title: "Réunion d'équipe", time: "10:00", location: "Salle de réunion" },
    { date: 18, title: "Validation des actes", time: "14:30", location: "Bureau" },
    { date: 22, title: "Rapport mensuel", time: "09:00", location: "En ligne" },
  ];

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => event.date === day);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📅 Calendrier</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion des rendez-vous et événements</p>
        </div>
        <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
          Retour au tableau de bord
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <div className="lg:col-span-2 card-modern p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day, index) => (
              <div key={index} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const isToday = day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative
                    ${isToday ? "bg-green-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                    ${hasEvents && !isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                  `}
                >
                  <span className="font-medium">{day}</span>
                  {hasEvents && !isToday && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.map((_, idx) => (
                        <div key={idx} className="w-1 h-1 bg-blue-500 rounded-full" />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Événements du jour */}
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Événements</h3>
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {event.location}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="mt-4 w-full btn-primary flex items-center justify-center gap-2" onClick={() => alert("📅 Nouvel événement ajouté!")}>
            <Plus size={18} />
            Ajouter un événement
          </button>
        </div>
      </div>
    </div>
  );
}
