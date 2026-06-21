"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Search, Users } from "lucide-react";
import { sedhiouCommunes, sedhiouDepartments } from "@/lib/sedhiou";

export default function EspaceMaires() {
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("all");

  const filteredCommunes = useMemo(() => {
    return sedhiouCommunes.filter((commune) => {
      const matchesSearch = commune.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = department === "all" || commune.department === department;
      return matchesSearch && matchesDepartment;
    });
  }, [searchTerm, department]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-4 inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            Région de Sédhiou
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Communes de <span className="gradient-text">Sédhiou</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Agent Connect est configuré pour les communes des départements de Bounkiling, Goudomp et Sédhiou.
          </p>
        </motion.div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          <TerritoryStat label="Départements" value={sedhiouDepartments.length} icon={MapPin} />
          <TerritoryStat label="Communes" value={sedhiouCommunes.length} icon={Building2} />
          <TerritoryStat label="Espace citoyen" value={1} icon={Users} />
          <TerritoryStat label="Région" value="Sédhiou" icon={MapPin} />
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une commune de Sédhiou..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white md:w-64"
          >
            <option value="all">Tous les départements</option>
            {sedhiouDepartments.map((item) => (
              <option key={item.name} value={item.name}>
                Département de {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCommunes.map((commune, index) => (
            <motion.div
              key={`${commune.department}-${commune.name}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-green-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:border-green-700"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                  <Building2 className="h-6 w-6 text-green-700 dark:text-green-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{commune.name}</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Département de {commune.department}, région de Sédhiou
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TerritoryStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof MapPin;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
        <Icon className="h-6 w-6 text-green-700 dark:text-green-300" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
