"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CreditCard, FileText, MapPin, Smartphone, Users } from "lucide-react";

export default function Home() {
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    agents: 0,
    citizens: 0,
    departments: 0,
    services: 6,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/public/stats", { cache: "no-store" });
        const data = await response.json();
        setPlatformStats(data);
      } catch (error) {
        setPlatformStats((current) => current);
      }
    };

    loadStats();
  }, []);

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-20">
          <img src="/request-types/administration.svg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="container relative mx-auto grid min-h-[82vh] items-center gap-10 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
              <MapPin size={16} />
              Région de Sédhiou
            </div>
            <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
              AgentConnect
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-200">
              Demandes citoyennes, paiement, traitement agent et retrait des dossiers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-600">
                Créer un compte
                <ArrowRight size={18} />
              </Link>
              <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100">
                Se connecter
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-2xl bg-white p-5 text-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Demande citoyenne</p>
                  <h2 className="mt-1 text-2xl font-bold">Extrait de naissance</h2>
                </div>
                <BadgeCheck className="h-9 w-9 text-emerald-600" />
              </div>
              <div className="mt-5 grid gap-3">
                <Feature icon={Smartphone} title="Paiement" text="À distance ou guichet" />
                <Feature icon={FileText} title="Traitement" text="Assignation à un agent" />
                <Feature icon={CreditCard} title="Retrait" text="Téléchargement ou guichet" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-12 dark:bg-gray-950">
        <div className="container mx-auto grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={platformStats.agents} label="Agents" icon={Users} />
          <Stat value={platformStats.citizens} label="Citoyens" icon={Building2} />
          <Stat value={platformStats.departments} label="Départements" icon={MapPin} />
          <Stat value={platformStats.services} label="Services" icon={FileText} />
        </div>
      </section>

      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Services disponibles</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Choix simple, suivi clair.</p>
            </div>
            <Link href="/demandes/nouvelle" className="hidden rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 md:inline-flex">
              Déposer
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              ["État civil", "/request-types/etat-civil.svg"],
              ["Résidence", "/request-types/residence.svg"],
              ["Administration", "/request-types/administration.svg"],
              ["Courrier", "/request-types/courrier.svg"],
            ].map(([title, image]) => (
              <div key={title} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <img src={image} alt="" className="h-32 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof FileText; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
      <div className="rounded-lg bg-emerald-100 p-2">
        <Icon className="h-5 w-5 text-emerald-700" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Stat({ value, label, icon: Icon }: { value: number; label: string; icon: typeof FileText }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <Icon className="h-6 w-6 text-emerald-600" />
      <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat("fr-FR").format(value)}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
