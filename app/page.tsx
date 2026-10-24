"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import AppInstallButton from "@/components/AppInstallButton";
import {
  ArrowRight, BadgeCheck, Building2, CalendarClock, CheckCircle2, CreditCard,
  Download, FileCheck2, FilePlus2, FileText, HelpCircle, MapPin, Phone, ShieldCheck, Smartphone,
  UserRound, Users,
} from "lucide-react";
import { useSession } from "next-auth/react";

type PlatformStats = {
  totalUsers: number;
  agents: number;
  citizens: number;
  departments: number;
  services: number;
};

type HeroImage = { src: string; title?: string; caption?: string };

type MunicipalityProfile = {
  name: string;
  region: string;
  address: string;
  phone?: string | null;
  email: string;
  website?: string | null;
  mayorName?: string | null;
  openingHours: string;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroAnnouncement?: string | null;
  heroImages?: HeroImage[];
};

const defaultStats: PlatformStats = { totalUsers: 0, agents: 0, citizens: 0, departments: 0, services: 0 };
const defaultProfile: MunicipalityProfile = {
  name: "Mairie de Sédhiou", region: "Sédhiou", address: "Sédhiou, Sénégal",
  phone: "", email: "contact@agent-connect.sn", website: "", mayorName: "",
  openingHours: "Lun - Ven: 8h - 17h", heroTitle: "Mairie de Sédhiou",
  heroSubtitle: "Services municipaux numériques, demandes citoyennes et suivi administratif.",
  heroAnnouncement: "Plateforme officielle des démarches citoyennes", heroImages: [],
};
const fallbackSlides: HeroImage[] = [
  { src: "/request-types/administration.svg", title: "Services municipaux", caption: "Un espace unique pour préparer vos démarches." },
  { src: "/request-types/etat-civil.svg", title: "Démarches administratives", caption: "Déposez une demande et retrouvez son suivi." },
  { src: "/request-types/residence.svg", title: "Commune de Sédhiou", caption: "Un accès numérique aux services de la commune." },
];
const platformName = "Sédhiou Connect";

function normalizeHeroImages(value: unknown): HeroImage[] {
  const images = typeof value === "string" ? safeParseImages(value) : value;
  if (!Array.isArray(images)) return [];
  return images.map((image) => ({
    src: typeof image?.src === "string" ? image.src : "",
    title: typeof image?.title === "string" ? image.title : "",
    caption: typeof image?.caption === "string" ? image.caption : "",
  })).filter((image) => image.src);
}
function safeParseImages(value: string) {
  try { return JSON.parse(value); } catch { return []; }
}

export default function Home() {
  const { status } = useSession();
  const shouldReduceMotion = useReducedMotion();
  const [platformStats, setPlatformStats] = useState(defaultStats);
  const [profile, setProfile] = useState<MunicipalityProfile>(defaultProfile);
  const [activeSlide, setActiveSlide] = useState(0);
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/public/stats", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
      fetch("/api/municipality", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
    ]).then(([stats, municipality]) => {
      if (!active) return;
      if (stats && typeof stats === "object") setPlatformStats({ ...defaultStats, ...stats });
      if (municipality?.profile) {
        setProfile({ ...defaultProfile, ...municipality.profile, heroImages: normalizeHeroImages(municipality.profile.heroImages) });
      }
    }).catch(() => {
      // The public page remains usable if statistics are temporarily unavailable.
    });
    return () => { active = false; };
  }, []);

  const slides = useMemo(() => {
    const customSlides = normalizeHeroImages(profile.heroImages);
    return customSlides.length ? customSlides : fallbackSlides;
  }, [profile.heroImages]);

  useEffect(() => {
    setActiveSlide((current) => current % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (shouldReduceMotion || slides.length < 2) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [slides.length, shouldReduceMotion]);

  const currentSlide = slides[activeSlide] || slides[0];
  const entrance = shouldReduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55 } };

  return (
    <main className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <section className="relative min-h-[82vh] overflow-hidden">
        <div className="absolute inset-0 bg-gray-950">
          {slides.map((slide, index) => <img key={`${slide.src}-${index}`} src={slide.src} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeSlide ? "opacity-75" : "opacity-0"}`} />)}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/75 to-gray-950/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-gray-950" />
        </div>

        <div className="container relative mx-auto grid min-h-[82vh] items-center gap-10 px-4 pb-16 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
          <motion.div {...entrance}>
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur">
              <MapPin size={16} /><span className="truncate">{profile.heroAnnouncement || `${profile.region} · ${profile.name}`}</span>
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-green-200">Services municipaux en ligne</p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">{profile.heroTitle || profile.name || platformName}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-100 md:text-lg">{profile.heroSubtitle || defaultProfile.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={isAuthenticated ? "/dashboard" : "/auth/register"} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700">
                {isAuthenticated ? "Accéder à mon espace" : "Créer mon compte"} <ArrowRight size={18} />
              </Link>
              <Link href="/demandes/nouvelle" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-gray-100">
                Déposer une demande
              </Link>
              <AppInstallButton variant="hero" />
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-green-300" /> Accès personnel</span>
              <span className="inline-flex items-center gap-2"><FileCheck2 size={16} className="text-green-300" /> Suivi des démarches</span>
            </div>
          </motion.div>

          <motion.div {...(shouldReduceMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.12, duration: 0.55 } })} className="rounded-2xl border border-white/15 bg-white/12 p-4 text-white shadow-2xl backdrop-blur sm:p-5">
            <div className="overflow-hidden rounded-xl bg-white text-gray-950">
              <img src={currentSlide.src} alt="" className="h-48 w-full object-cover sm:h-56" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-sm font-medium text-green-700">{profile.name}</p><h2 className="mt-1 text-2xl font-bold">{currentSlide.title || "Bienvenue"}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{currentSlide.caption || profile.address}</p></div>
                  <BadgeCheck className="h-9 w-9 flex-none text-green-600" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniInfo icon={Phone} label="Contact" value={profile.phone || profile.email} />
                  <MiniInfo icon={CalendarClock} label="Horaires" value={profile.openingHours} />
                  <MiniInfo icon={MapPin} label="Adresse" value={profile.address} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2" aria-label="Images de présentation">
              {slides.map((_, index) => <button key={index} type="button" aria-label={`Afficher l'image ${index + 1}`} aria-pressed={index === activeSlide} onClick={() => setActiveSlide(index)} className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-10 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"}`} />)}
            </div>
          </motion.div>
        </div>
      </section>

      <section aria-label="Message de bienvenue" className="overflow-hidden bg-green-700 py-3 text-white">
        <p className="sr-only">Bienvenue à Sédhiou. La mairie vous souhaite la bienvenue sur Sédhiou Connect.</p>
        <motion.div
          aria-hidden="true"
          className="flex w-max items-center gap-8 whitespace-nowrap text-sm font-semibold tracking-wide sm:text-base"
          animate={shouldReduceMotion ? undefined : { x: ["0%", "-50%"] }}
          transition={shouldReduceMotion ? undefined : { duration: 24, ease: "linear", repeat: Infinity }}
        >
          {[0, 1].map((copy) => (
            <span key={copy} className="flex shrink-0 items-center gap-8 px-4">
              <span>Bienvenue à Sédhiou</span>
              <span className="text-green-200" aria-hidden="true">✦</span>
              <span>La mairie vous souhaite la bienvenue sur Sédhiou Connect</span>
              <span className="text-green-200" aria-hidden="true">✦</span>
              <span>Vos démarches en ligne, simplement</span>
              <span className="text-green-200" aria-hidden="true">✦</span>
            </span>
          ))}
        </motion.div>
      </section>

      <section className="bg-white py-8 dark:bg-gray-950">
        <div className="container mx-auto grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={platformStats.agents} label="Agents" icon={Users} />
          <Stat value={platformStats.citizens} label="Citoyens inscrits" icon={UserRound} />
          <Stat value={platformStats.departments} label="Départements" icon={Building2} />
          <Stat value={platformStats.services} label="Démarches disponibles" icon={FileText} />
        </div>
        <p className="container mx-auto mt-3 px-4 text-xs text-gray-400">Les chiffres sont actualisés depuis les données publiques de la plateforme.</p>
      </section>

      <section className="bg-slate-950 py-14 text-white">
        <div className="container mx-auto grid items-center gap-6 px-4 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-400/15 text-green-200 ring-1 ring-green-300/20"><Smartphone className="h-6 w-6" /></div>
            <div><p className="text-sm font-semibold uppercase tracking-wider text-green-200">Sur votre téléphone</p><h2 className="mt-2 text-2xl font-bold md:text-3xl">Retrouvez {platformName} en ligne</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Ajoutez la plateforme à l’écran d’accueil de votre téléphone pour retrouver facilement vos démarches et leur suivi.</p></div>
          </div>
          <AppInstallButton variant="section" />
        </div>
      </section>

      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div><p className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Démarches</p><h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">Les services à portée de main</h2><p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">Consultez les démarches proposées et choisissez le service adapté à votre besoin.</p></div>
            <Link href="/demandes/nouvelle" className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">Voir les démarches <ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Service title="État civil" text="Retrouvez les démarches et documents proposés par la commune." icon={FileText} image="/request-types/etat-civil.svg" />
            <Service title="Résidence" text="Accédez aux demandes liées à votre résidence communale." icon={MapPin} image="/request-types/residence.svg" />
            <Service title="Paiement" text="Consultez les modalités de paiement associées à chaque démarche." icon={CreditCard} image="/request-types/administration.svg" />
            <Service title="Retrait des documents" text="Consultez les options disponibles pour récupérer votre document." icon={Download} image="/request-types/courrier.svg" />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Comment ça marche</p><h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">Votre démarche, étape par étape</h2><p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">Un parcours simple pour déposer une demande et suivre son évolution.</p></div>
          <div className="grid gap-4 md:grid-cols-3">
            <Step number="01" icon={UserRound} title="Créez votre espace" text="Inscrivez-vous pour accéder à votre espace personnel et retrouver vos démarches au même endroit." />
            <Step number="02" icon={FilePlus2} title="Choisissez une démarche" text="Consultez les services disponibles, renseignez les informations demandées et joignez les pièces utiles." />
            <Step number="03" icon={CheckCircle2} title="Suivez son avancement" text="Retrouvez le statut et les mises à jour de votre demande dans votre historique." />
          </div>
        </div>
      </section>

      <section className="bg-green-50 py-14 dark:bg-green-950/20">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-300">Votre espace en ligne</p><h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">Vos démarches restent faciles à retrouver</h2><p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">Connectez-vous pour retrouver vos demandes, consulter leur état et accéder aux informations liées à leur traitement.</p><Link href={isAuthenticated ? "/demandes/historique" : "/auth/login"} className="mt-5 inline-flex items-center gap-2 font-semibold text-green-800 hover:text-green-950 dark:text-green-200">Ouvrir mon historique <ArrowRight size={17} /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={FileText} title="Un historique clair" text="Références, dates, statuts et détails de vos demandes sont regroupés dans votre compte." />
            <InfoCard icon={ShieldCheck} title="Un espace personnel" text="Chaque citoyen retrouve ses propres demandes après connexion." />
            <InfoCard icon={CreditCard} title="Informations pratiques" text="Consultez les modalités de paiement et de retrait associées à vos démarches." />
            <InfoCard icon={HelpCircle} title="Besoin d’aide ?" text={`Contactez la mairie au ${profile.phone || profile.email} pour toute question sur les services.`} />
          </div>
        </div>
      </section>

      <section className="bg-white py-14 dark:bg-gray-950">
        <div className="container mx-auto grid items-center gap-6 rounded-3xl bg-gray-950 px-6 py-9 text-white sm:px-10 lg:grid-cols-[1fr_auto]">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-green-200">Commencez maintenant</p><h2 className="mt-2 text-2xl font-bold md:text-3xl">Accédez aux services de {profile.name}</h2><p className="mt-2 max-w-2xl leading-6 text-gray-300">Créez votre compte ou connectez-vous pour déposer une demande et retrouver son suivi.</p></div>
          <div className="flex flex-wrap gap-3"><Link href={isAuthenticated ? "/dashboard" : "/auth/register"} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">{isAuthenticated ? "Mon espace" : "Créer un compte"} <ArrowRight size={17} /></Link><Link href="/demandes/nouvelle" className="inline-flex items-center rounded-xl bg-white px-5 py-3 font-semibold text-gray-950 hover:bg-gray-100">Voir les démarches</Link></div>
        </div>
      </section>
    </main>
  );
}

function MiniInfo({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return <div className="rounded-xl bg-gray-50 p-3"><Icon className="h-4 w-4 text-green-700" /><p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">{value || "—"}</p></div>;
}
function Stat({ value, label, icon: Icon }: { value: number; label: string; icon: typeof FileText }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"><Icon className="h-6 w-6 text-green-700 dark:text-green-400" /><p className="mt-4 text-3xl font-bold text-gray-950 dark:text-white">{new Intl.NumberFormat("fr-FR").format(value)}</p><p className="text-sm text-gray-500 dark:text-gray-400">{label}</p></div>;
}
function Service({ title, text, icon: Icon, image }: { title: string; text: string; icon: typeof FileText; image: string }) {
  return <Link href="/demandes/nouvelle" className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-green-700"><img src={image} alt="" className="h-32 w-full object-cover" /><div className="p-5"><div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"><Icon size={20} /></div><h3 className="text-lg font-semibold text-gray-950 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{text}</p></div></Link>;
}
function Step({ number, icon: Icon, title, text }: { number: string; icon: typeof FileText; title: string; text: string }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"><div className="flex items-center justify-between"><span className="text-sm font-bold tracking-widest text-green-700 dark:text-green-300">{number}</span><span className="rounded-xl bg-green-100 p-3 text-green-700 dark:bg-green-950/50 dark:text-green-300"><Icon size={21} /></span></div><h3 className="mt-5 text-lg font-semibold text-gray-950 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{text}</p></div>;
}
function InfoCard({ icon: Icon, title, text }: { icon: typeof FileText; title: string; text: string }) {
  return <div className="rounded-2xl border border-green-100 bg-white p-5 dark:border-green-900/60 dark:bg-gray-900"><Icon className="h-5 w-5 text-green-700 dark:text-green-300" /><h3 className="mt-3 font-semibold text-gray-950 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{text}</p></div>;
}
