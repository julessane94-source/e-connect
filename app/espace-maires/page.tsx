"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  FileText,
  Landmark,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { sedhiouCommunes, sedhiouDepartments } from "@/lib/sedhiou";
import { defaultRequestTypes } from "@/lib/request-types";

type CommuneItem = {
  name: string;
  department: string;
};

const serviceGroups = [
  { label: "État civil", icon: FileText, categories: ["État civil"] },
  { label: "Résidence", icon: MapPin, categories: ["Résidence"] },
  { label: "Administration", icon: ShieldCheck, categories: ["Administration"] },
  { label: "Courrier", icon: Landmark, categories: ["Courrier"] },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

export default function EspaceMaires() {
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("all");
  const [selectedCommune, setSelectedCommune] = useState<CommuneItem>(sedhiouCommunes[0]);

  const filteredCommunes = useMemo(() => {
    return sedhiouCommunes.filter((commune) => {
      const matchesSearch = commune.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = department === "all" || commune.department === department;
      return matchesSearch && matchesDepartment;
    });
  }, [searchTerm, department]);

  const servicesByCategory = useMemo(() => {
    return serviceGroups.map((group) => ({
      ...group,
      services: defaultRequestTypes.filter((type) => group.categories.includes(type.category)),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-sm dark:border-slate-800"
        >
          <div className="grid gap-0 lg:grid-cols-[1.45fr_0.9fr]">
            <div className="p-6 sm:p-8">
              <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100 ring-1 ring-cyan-300/20">
                Région de Sédhiou
              </span>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
                Espace des communes
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Cliquez sur une commune pour consulter ses informations, son compte de gestion et les services disponibles pour les citoyens.
              </p>
            </div>
            <div className="border-t border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="grid grid-cols-2 gap-3">
                <TerritoryStat label="Départements" value={sedhiouDepartments.length} icon={MapPin} />
                <TerritoryStat label="Communes" value={sedhiouCommunes.length} icon={Building2} />
                <TerritoryStat label="Services" value={defaultRequestTypes.length} icon={FileText} />
                <TerritoryStat label="Coordination" value="1" icon={Users} />
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="card-modern p-5">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher une commune..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="input-modern w-full pl-10"
                />
              </div>
              <select value={department} onChange={(event) => setDepartment(event.target.value)} className="input-modern w-full">
                <option value="all">Tous les départements</option>
                {sedhiouDepartments.map((item) => (
                  <option key={item.name} value={item.name}>
                    Département de {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {filteredCommunes.map((commune, index) => {
                const active = selectedCommune.name === commune.name;
                return (
                  <motion.button
                    key={`${commune.department}-${commune.name}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015 }}
                    type="button"
                    onClick={() => setSelectedCommune(commune)}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      active
                        ? "border-cyan-300 bg-cyan-50 text-cyan-950 ring-1 ring-cyan-200 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-100 dark:ring-cyan-900"
                        : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-cyan-900 dark:hover:bg-cyan-950/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${active ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold">{commune.name}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Département de {commune.department}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <CommuneDetails commune={selectedCommune} />

            <div className="card-modern p-6">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">Services accessibles</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Les demandes peuvent être déposées directement pour la commune de {selectedCommune.name}.
                  </p>
                </div>
                <Link
                  href={`/demandes/nouvelle?commune=${encodeURIComponent(selectedCommune.name)}`}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  Accéder à ses services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {servicesByCategory.map((group) => (
                  <ServiceGroup key={group.label} label={group.label} icon={group.icon} services={group.services} commune={selectedCommune.name} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function CommuneDetails({ commune }: { commune: CommuneItem }) {
  const email = `agent.${slugify(commune.name)}@agent-connect.sn`;

  return (
    <section className="card-modern overflow-hidden">
      <div className="grid gap-0 xl:grid-cols-[1fr_320px]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-cyan-50 p-3 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Mairie communale</p>
              <h2 className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">{commune.name}</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Département de {commune.department}, région de Sédhiou.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Info label="Compte de gestion" value={email} />
            <Info label="Rôle" value="Compte commune" />
            <Info label="Mot de passe initial" value="commune123" />
          </div>
        </div>
        <div className="border-t border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50 xl:border-l xl:border-t-0">
          <h3 className="font-semibold text-gray-950 dark:text-white">Circuit de traitement</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <Step index="1" text="Le citoyen choisit cette commune pour sa demande." />
            <Step index="2" text="La coordination peut transférer un dossier mal orienté." />
            <Step index="3" text="Le compte communal traite et notifie le citoyen." />
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceGroup({
  label,
  icon: Icon,
  services,
  commune,
}: {
  label: string;
  icon: LucideIcon;
  services: typeof defaultRequestTypes;
  commune: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-gray-950 dark:text-white">{label}</h3>
      </div>
      <div className="space-y-2">
        {services.map((service) => (
          <Link
            key={service.code}
            href={`/demandes/nouvelle?commune=${encodeURIComponent(commune)}&type=${encodeURIComponent(service.code)}`}
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-cyan-50 dark:hover:bg-cyan-950/20"
          >
            <span className="text-gray-700 dark:text-gray-200">{service.name}</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{service.price.toLocaleString("fr-FR")} FCFA</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TerritoryStat({ label, value, icon: Icon }: { label: string; value: number | string; icon: LucideIcon }) {
  return (
    <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/10">
      <Icon className="mb-3 h-5 w-5 text-cyan-200" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-300">{label}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-gray-950 dark:text-white">{value}</p>
    </div>
  );
}

function Step({ index, text }: { index: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
        {index}
      </span>
      <p>{text}</p>
    </div>
  );
}
