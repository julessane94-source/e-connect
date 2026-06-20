"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Award, Users, Building2, Phone, Mail, Globe, Quote, Star, ArrowRight } from "lucide-react";

export function MaireCard({ maire }: { maire: any }) {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl"
    >
      <div className="relative h-48">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-2xl font-bold text-white">{maire.name}</h3>
          <p className="text-green-200 text-sm">{maire.municipality}</p>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
            <Calendar size={12} />
            {maire.term}
          </span>
          <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
            <Award size={12} />
            {maire.achievements}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {maire.bio}
        </p>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {maire.location}
            </span>
            <span className="flex items-center gap-1">
              <Building2 size={14} />
              {maire.department}
            </span>
          </div>
          <div className="flex gap-3 mt-3">
            <a href="#" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Phone size={16} className="text-gray-600 dark:text-gray-400" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Mail size={16} className="text-gray-600 dark:text-gray-400" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Globe size={16} className="text-gray-600 dark:text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AchievementCard({ achievement }: { achievement: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <achievement.icon size={24} className="text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{achievement.description}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">{achievement.date}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <Quote size={24} className="text-green-500 flex-shrink-0" />
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic">
          "{testimonial.content}"
        </p>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}
