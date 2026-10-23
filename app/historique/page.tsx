"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, Building2, Calendar, CheckCircle, FileText, MapPin, ShieldCheck, Users } from "lucide-react";

const milestones = [
  { title: "Une idée de proximité", description: "Faciliter les échanges entre les habitants et les services municipaux, et rendre les démarches plus simples à retrouver.", icon: BookOpen },
  { title: "Des démarches réunies", description: "Mettre les informations et les demandes au même endroit pour aider chaque citoyen à commencer sa démarche.", icon: Building2 },
  { title: "Un suivi plus clair", description: "Donner aux citoyens un espace pour consulter l’avancement de leurs dossiers et retrouver les mises à jour.", icon: CheckCircle },
  { title: "Une plateforme qui évolue", description: "Faire évoluer les outils et les parcours au fil des besoins des citoyens et des équipes municipales.", icon: Award },
];

const principles = [
  { title: "Proximité", text: "Des services municipaux plus faciles à trouver.", icon: MapPin },
  { title: "Clarté", text: "Des étapes et des informations présentées simplement.", icon: FileText },
  { title: "Suivi", text: "Un espace personnel pour retrouver l’avancement des dossiers.", icon: ShieldCheck },
];

export default function Historique() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="overflow-hidden bg-slate-50 text-slate-950 dark:bg-gray-950 dark:text-white">
      <section className="relative isolate bg-slate-950">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-slate-950 to-slate-950" />
        </div>
        <div className="container mx-auto grid min-h-[440px] items-center gap-10 px-4 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-300/20 bg-green-300/10 px-4 py-2 text-sm font-medium text-green-100">
              <span className="h-2 w-2 rounded-full bg-green-300" /> À propos de la plateforme
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Une histoire tournée vers le <span className="text-green-300">service citoyen</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Sédhiou Connect rapproche les citoyens et les services municipaux grâce à un espace numérique pensé pour les démarches, les informations et leur suivi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-green-500">
                Créer mon espace <ArrowRight size={17} />
              </Link>
              <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                Se connecter
              </Link>
            </div>
          </motion.div>

          <motion.div initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.6 }} className="relative">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-200">Notre ambition</p><h2 className="mt-3 text-2xl font-bold text-white">Des démarches plus proches de vous</h2></div>
                <span className="rounded-2xl bg-green-400/15 p-3 text-green-200"><Building2 size={24} /></span>
              </div>
              <p className="mt-4 leading-7 text-slate-300">Retrouvez les démarches proposées, déposez un dossier et consultez les informations liées à son traitement.</p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-2xl font-bold text-white">En ligne</p><p className="mt-1 text-xs text-slate-400">Accès aux services</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-2xl font-bold text-white">À chaque étape</p><p className="mt-1 text-xs text-slate-400">Suivi des demandes</p></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-2xl border border-green-200/20 bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-xl sm:flex"><CheckCircle size={17} /> Un espace pensé pour les citoyens</div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto grid gap-4 px-4 py-10 md:grid-cols-3">
        {principles.map(({ title, text, icon: Icon }, index) => (
          <motion.article key={title} initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08, duration: 0.4 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="inline-flex rounded-xl bg-green-100 p-3 text-green-800 dark:bg-green-950/60 dark:text-green-200"><Icon size={21} /></span>
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
          </motion.article>
        ))}
      </section>

      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700 dark:text-green-300">Notre parcours</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">De l’idée à un service utile au quotidien</h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">La plateforme s’articule autour d’un objectif : rendre les démarches municipales plus accessibles et leur suivi plus compréhensible.</p>
        </div>
        <div className="mx-auto max-w-4xl space-y-4">
          {milestones.map(({ title, description, icon: Icon }, index) => (
            <motion.article key={title} initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.06, duration: 0.4 }} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:gap-6 sm:p-6">
              <div className="flex shrink-0 flex-col items-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200"><Icon size={22} /></span><span className="mt-2 text-xs font-bold tracking-widest text-green-700 dark:text-green-300">0{index + 1}</span></div>
              <div className="pt-1"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">{description}</p></div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-white py-14 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700 dark:text-green-300">Aujourd’hui</p>
              <h2 className="mt-3 text-3xl font-bold">Une plateforme au service des démarches</h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">Les citoyens peuvent créer leur espace, consulter les services disponibles et retrouver le suivi de leurs dossiers après connexion.</p>
              <Link href="/auth/register" className="mt-6 inline-flex items-center gap-2 font-semibold text-green-800 hover:text-green-950 dark:text-green-300">Découvrir mon espace <ArrowRight size={17} /></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Feature icon={Users} title="Un espace citoyen" text="Un compte personnel pour retrouver ses démarches." />
              <Feature icon={FileText} title="Des services accessibles" text="Les démarches disponibles sont présentées depuis la plateforme." />
              <Feature icon={Calendar} title="Un suivi étape par étape" text="Les mises à jour d’un dossier sont consultables dans son espace." />
              <Feature icon={ShieldCheck} title="Une évolution continue" text="Les parcours et outils peuvent progresser avec les besoins des usagers." />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-green-700 to-emerald-600 p-7 text-white shadow-xl sm:p-10 md:flex-row md:items-center">
          <div><p className="text-sm font-semibold uppercase tracking-[0.15em] text-green-100">Votre prochaine étape</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Commencez vos démarches en ligne</h2><p className="mt-2 max-w-2xl leading-6 text-green-50">Créez votre espace ou connectez-vous pour retrouver les services et le suivi de vos demandes.</p></div>
          <Link href="/auth/register" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-green-800 transition hover:bg-green-50">Créer un compte <ArrowRight size={17} /></Link>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof FileText; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <span className="inline-flex rounded-xl bg-green-100 p-3 text-green-800 dark:bg-green-950/60 dark:text-green-200"><Icon size={20} /></span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
    </article>
  );
}
