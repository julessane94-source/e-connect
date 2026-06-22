"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CalendarClock, CreditCard, Download, FileText, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import { useSession } from "next-auth/react";

type PlatformStats = {
  totalUsers: number;
  agents: number;
  citizens: number;
  departments: number;
  services: number;
};

type HeroImage = {
  src: string;
  title?: string;
  caption?: string;
};

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

const defaultStats: PlatformStats = {
  totalUsers: 0,
  agents: 0,
  citizens: 0,
  departments: 0,
  services: 6,
};

const defaultProfile: MunicipalityProfile = {
  name: "Mairie de Sédhiou",
  region: "Sédhiou",
  address: "Sédhiou, Sénégal",
  phone: "",
  email: "contact@agent-connect.sn",
  website: "",
  mayorName: "",
  openingHours: "Lun - Ven: 8h - 17h",
  heroTitle: "Mairie de Sédhiou",
  heroSubtitle: "Services municipaux numériques, demandes citoyennes et suivi administratif.",
  heroAnnouncement: "Plateforme officielle des démarches citoyennes",
  heroImages: [],
};

const fallbackSlides: HeroImage[] = [
  {
    src: "/request-types/administration.svg",
    title: "Services municipaux",
    caption: "Une entrée unique pour les démarches administratives.",
  },
  {
    src: "/request-types/etat-civil.svg",
    title: "État civil",
    caption: "Demandes, suivi, traitement et documents signés.",
  },
  {
    src: "/request-types/residence.svg",
    title: "Commune de Sédhiou",
    caption: "Des services organisés pour les citoyens et les agents.",
  },
];

function normalizeHeroImages(value: unknown): HeroImage[] {
  const images = typeof value === "string" ? safeParseImages(value) : value;
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => ({
      src: typeof image?.src === "string" ? image.src : "",
      title: typeof image?.title === "string" ? image.title : "",
      caption: typeof image?.caption === "string" ? image.caption : "",
    }))
    .filter((image) => image.src);
}

function safeParseImages(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export default function Home() {
  const { status } = useSession();
  const [platformStats, setPlatformStats] = useState(defaultStats);
  const [profile, setProfile] = useState<MunicipalityProfile>(defaultProfile);
  const [activeSlide, setActiveSlide] = useState(0);
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [statsResponse, municipalityResponse] = await Promise.all([
          fetch("/api/public/stats", { cache: "no-store" }),
          fetch("/api/municipality", { cache: "no-store" }),
        ]);

        if (statsResponse.ok) {
          setPlatformStats(await statsResponse.json());
        }

        if (municipalityResponse.ok) {
          const data = await municipalityResponse.json();
          setProfile({ ...defaultProfile, ...data.profile, heroImages: normalizeHeroImages(data.profile?.heroImages) });
        }
      } catch {
        setPlatformStats((current) => current);
      }
    };

    loadHomeData();
  }, []);

  const slides = useMemo(() => {
    const customSlides = normalizeHeroImages(profile.heroImages);
    return customSlides.length ? customSlides : fallbackSlides;
  }, [profile.heroImages]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide] || slides[0];

  return (
    <main className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <section className="relative min-h-[88vh] overflow-hidden">
        <div className="absolute inset-0 bg-gray-950">
          {slides.map((slide, index) => (
            <img
              key={`${slide.src}-${index}`}
              src={slide.src}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeSlide ? "opacity-80" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-gray-950/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-gray-950" />
        </div>

        <div className="container relative mx-auto grid min-h-[88vh] items-end gap-10 px-4 pb-16 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur">
              <MapPin size={16} />
              <span className="truncate">{profile.heroAnnouncement || `${profile.region} - ${profile.name}`}</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              {profile.heroTitle || profile.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-100 md:text-lg">
              {profile.heroSubtitle || "Services municipaux numériques, demandes citoyennes et suivi administratif."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={isAuthenticated ? "/dashboard" : "/auth/register"} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700">
                {isAuthenticated ? "Ouvrir mon espace" : "Créer un compte"}
                <ArrowRight size={18} />
              </Link>
              <Link href="/demandes/nouvelle" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-gray-100">
                Déposer une demande
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="rounded-2xl border border-white/15 bg-white/12 p-5 text-white shadow-2xl backdrop-blur">
            <div className="overflow-hidden rounded-xl bg-white text-gray-950">
              <img src={currentSlide.src} alt="" className="h-56 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-700">{profile.name}</p>
                    <h2 className="mt-1 text-2xl font-bold">{currentSlide.title || "Accueil municipal"}</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{currentSlide.caption || profile.address}</p>
                  </div>
                  <BadgeCheck className="h-9 w-9 flex-none text-green-600" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniInfo icon={Phone} label="Contact" value={profile.phone || profile.email} />
                  <MiniInfo icon={CalendarClock} label="Horaires" value={profile.openingHours} />
                  <MiniInfo icon={MapPin} label="Adresse" value={profile.address} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Afficher l'image ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-10 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-10 dark:bg-gray-950">
        <div className="container mx-auto grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={platformStats.agents} label="Agents" icon={Users} />
          <Stat value={platformStats.citizens} label="Citoyens" icon={Building2} />
          <Stat value={platformStats.departments} label="Départements" icon={MapPin} />
          <Stat value={platformStats.services} label="Services" icon={FileText} />
        </div>
      </section>

      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Démarches</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">Services disponibles</h2>
            </div>
            <Link href="/demandes/nouvelle" className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
              Commencer
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            <Service title="État civil" text="Extraits, certificats et documents liés aux actes." icon={FileText} image="/request-types/etat-civil.svg" />
            <Service title="Résidence" text="Demandes communales selon la commune du citoyen." icon={MapPin} image="/request-types/residence.svg" />
            <Service title="Paiement" text="Paiement à distance ou passage au guichet." icon={CreditCard} image="/request-types/administration.svg" />
            <Service title="Retrait" text="Téléchargement autorisé ou retrait au guichet." icon={Download} image="/request-types/courrier.svg" />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-gray-950">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Fonctionnement</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">Un parcours clair pour chaque demande</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Step icon={FileText} title="Demande" text="Le citoyen choisit son service et joint ses fichiers." />
            <Step icon={ShieldCheck} title="Traitement" text="L'admin assigne, l'agent vérifie et génère le document." />
            <Step icon={BadgeCheck} title="Retrait" text="Le dossier signé est remis au guichet ou téléchargé." />
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniInfo({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <Icon className="h-4 w-4 text-green-700" />
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">{value || "-"}</p>
    </div>
  );
}

function Stat({ value, label, icon: Icon }: { value: number; label: string; icon: typeof FileText }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <Icon className="h-6 w-6 text-green-700 dark:text-green-400" />
      <p className="mt-4 text-3xl font-bold text-gray-950 dark:text-white">{new Intl.NumberFormat("fr-FR").format(value)}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function Service({ title, text, icon: Icon, image }: { title: string; text: string; icon: typeof FileText; image: string }) {
  return (
    <Link href="/demandes/nouvelle" className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-green-700">
      <img src={image} alt="" className="h-32 w-full object-cover" />
      <div className="p-5">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{text}</p>
      </div>
    </Link>
  );
}

function Step({ icon: Icon, title, text }: { icon: typeof FileText; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
      <Icon className="h-6 w-6 text-green-700 dark:text-green-400" />
      <h3 className="mt-4 font-semibold text-gray-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  );
}
