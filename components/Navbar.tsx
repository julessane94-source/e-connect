"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  FileText,
  History,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Settings,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSession } from "next-auth/react";

type MenuItem = { label: string; href: string; icon: LucideIcon };

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstitutionOpen, setIsInstitutionOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const role = session?.user?.role || null;
  const isCoordination = role === "ADMIN" || role === "MANAGER";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setUnreadNotifications(0);
      return () => { active = false; };
    }

    fetch("/api/notifications", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data) setUnreadNotifications(Number(data.unread) || 0);
      })
      .catch(() => undefined);

    return () => { active = false; };
  }, [isAuthenticated]);

  useEffect(() => {
    setIsOpen(false);
    setIsInstitutionOpen(false);
    setIsWorkspaceOpen(false);
  }, [pathname]);

  const publicItems: MenuItem[] = [
    { label: "Accueil", href: "/", icon: Home },
    { label: "Nos services", href: "/nos-services", icon: Briefcase },
  ];
  const institutionItems: MenuItem[] = [
    { label: "Historique", href: "/historique", icon: History },
    { label: "À propos", href: "/a-propos", icon: Info },
    { label: "Espace des maires", href: "/espace-maires", icon: Users },
  ];
  const workspaceItems: MenuItem[] = isAuthenticated
    ? [
        { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { label: role ? "Dossiers" : "Mes demandes", href: "/demandes", icon: FileText },
        ...(!role
          ? [
              { label: "Déposer une demande", href: "/demandes/nouvelle", icon: Plus },
              { label: "Suivre mes demandes", href: "/demandes/suivi", icon: History },
              { label: "Mon profil", href: "/profil", icon: UserRound },
            ]
          : []),
        ...(isCoordination
          ? [{ label: "Administration", href: "/parametres", icon: Settings }]
          : []),
        { label: "Notifications" + (unreadNotifications > 0 ? " (" + unreadNotifications + ")" : ""), href: "/notifications", icon: Bell },
      ]
    : [];

  const roleLabel = role === "ADMIN"
    ? "Administration"
    : role === "MANAGER"
      ? "Coordination"
      : role
        ? "Espace agent"
        : "Espace citoyen";

  return (
    <>
      <nav className={"fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 " + (
        scrolled
          ? "border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95"
          : "border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/85"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Sedhiou-connect, accueil">
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                <img src="/sedhiou-logo.jpg" alt="" aria-hidden="true" className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                  Sedhiou<span className="gradient-text">-connect</span>
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">Services municipaux</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {publicItems.map((item) => (
                <DesktopLink key={item.href} item={item} pathname={pathname} />
              ))}

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={isInstitutionOpen}
                  onClick={() => {
                    setIsInstitutionOpen((open) => !open);
                    setIsWorkspaceOpen(false);
                  }}
                  className={"inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition " + (
                    institutionItems.some((item) => isActive(pathname, item.href))
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  Institution
                  <ChevronDown className={"h-4 w-4 transition-transform " + (isInstitutionOpen ? "rotate-180" : "")} />
                </button>
                <AnimatePresence>
                  {isInstitutionOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
                    >
                      {institutionItems.map((item) => (
                        <DropdownLink key={item.href} item={item} pathname={pathname} onClick={() => setIsInstitutionOpen(false)} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAuthenticated ? (
                <div className="relative ml-2">
                  <button
                    type="button"
                    aria-expanded={isWorkspaceOpen}
                    onClick={() => {
                      setIsWorkspaceOpen((open) => !open);
                      setIsInstitutionOpen(false);
                    }}
                    className={"inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition " + (
                      isWorkspaceOpen || pathname?.startsWith("/dashboard") || pathname?.startsWith("/parametres") || pathname?.startsWith("/demandes")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                    )}
                  >
                    <UserRound className="h-4 w-4" />
                    Mon espace
                    <span className="hidden xl:inline text-xs font-medium text-slate-500 dark:text-slate-400">{roleLabel}</span>
                    <ChevronDown className={"h-4 w-4 transition-transform " + (isWorkspaceOpen ? "rotate-180" : "")} />
                  </button>
                  <AnimatePresence>
                    {isWorkspaceOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
                      >
                        <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{roleLabel}</p>
                        {workspaceItems.map((item) => (
                          <DropdownLink key={item.href} item={item} pathname={pathname} onClick={() => setIsWorkspaceOpen(false)} />
                        ))}
                        <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                        <Link
                          href="/auth/logout"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                        >
                          <LogOut className="h-4 w-4" />
                          Déconnexion
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="ml-2 flex items-center gap-2">
                  <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30">
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Link>
                  <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    <UserPlus className="h-4 w-4" />
                    Inscription
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900 lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={isOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le menu"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="absolute inset-y-0 right-0 flex w-[min(90vw,390px)] flex-col overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-950"
            >
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">Navigation</p>
                  {isAuthenticated && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>}
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Fermer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <MobileMenuSection title="Découvrir" items={publicItems} pathname={pathname} onNavigate={() => setIsOpen(false)} />
                <MobileMenuSection title="Institution" items={institutionItems} pathname={pathname} onNavigate={() => setIsOpen(false)} />
                {isAuthenticated && (
                  <MobileMenuSection title={roleLabel} items={workspaceItems} pathname={pathname} onNavigate={() => setIsOpen(false)} />
                )}
              </div>

              <div className="mt-auto space-y-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                {isAuthenticated ? (
                  <>
                    <p className="px-1 text-sm font-medium text-slate-600 dark:text-slate-300">{session?.user?.name || "Compte connecté"}</p>
                    <Link href="/auth/logout" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700">
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 font-semibold text-emerald-800 dark:border-emerald-900 dark:text-emerald-300">
                      <LogIn className="h-4 w-4" />
                      Se connecter
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white dark:bg-white dark:text-slate-950">
                      <UserPlus className="h-4 w-4" />
                      Inscription citoyen
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

function DesktopLink({ item, pathname }: { item: MenuItem; pathname: string | null }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={"inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition " + (
        active
          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
      )}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

function DropdownLink({ item, pathname, onClick }: { item: MenuItem; pathname: string | null; onClick: () => void }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition " + (
        active
          ? "bg-emerald-50 font-semibold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

function MobileMenuSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: MenuItem[];
  pathname: string | null;
  onNavigate: () => void;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      <div className="space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={"flex items-center gap-3 rounded-xl px-4 py-3 transition " + (
                active
                  ? "bg-emerald-50 font-semibold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
