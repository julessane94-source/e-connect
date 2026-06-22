"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Home, 
  History, 
  Info, 
  Briefcase, 
  Users, 
  LogIn,
  LogOut,
  UserPlus,
  UserRound,
  Bell,
  ChevronDown,
  Building2,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isStaff = Boolean(session?.user?.role);
  const isCitizen = isAuthenticated && !isStaff;
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadNotifications(0);
      return;
    }

    const loadNotifications = async () => {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setUnreadNotifications(data.unread ?? 0);
    };

    loadNotifications();
  }, [isAuthenticated]);

  const menuItems = [
    { label: "Accueil", href: "/", icon: Home },
    { label: "Historique", href: "/historique", icon: History },
    { label: "À Propos", href: "/a-propos", icon: Info },
    { label: "Nos Services", href: "/nos-services", icon: Briefcase },
    { label: "Espace des Maires", href: "/espace-maires", icon: Users },
    ...(isAuthenticated ? [{ label: "Demandes", href: "/demandes", icon: FileText }] : []),
    ...(isStaff ? [{ label: "Administration", href: "/parametres", icon: Building2 }] : []),
  ];

  return (
    <>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "border-gray-200 bg-white/90 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90" : "border-white/10 bg-white/75 backdrop-blur-xl dark:bg-gray-950/70"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <motion.div 
                className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-green-700 shadow-lg shadow-green-700/20"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Building2 className="h-6 w-6 text-white" />
              </motion.div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Agent<span className="gradient-text">Connect</span>
                </h1>
                <p className="truncate text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">Services municipaux</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden min-w-0 items-center gap-1 lg:flex">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="mx-2 h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
              
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-xl border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                  >
                    <Users size={18} />
                    Tableau de bord
                  </Link>
                  <Link
                    href="/notifications"
                    className="relative flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Bell size={18} />
                    Notifications
                    {unreadNotifications > 0 && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                  {isCitizen && (
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <UserRound size={18} />
                      Profil
                    </Link>
                  )}
                  <Link
                    href="/auth/logout"
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-red-700 hover:shadow-xl"
                  >
                    <LogOut size={18} />
                    Déconnexion
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 rounded-xl border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                  >
                    <LogIn size={18} />
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-green-800 hover:shadow-xl"
                  >
                    <UserPlus size={18} />
                    Inscription citoyen
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-xl p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <div className="fixed right-0 top-0 h-full w-[min(88vw,360px)] overflow-y-auto bg-white p-6 shadow-2xl dark:bg-gray-900">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      Agent<span className="gradient-text">Connect</span>
                    </h1>
                  </div>
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        isActive 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-green-200 text-green-700 dark:text-green-300 dark:border-green-800 rounded-xl font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                      >
                        <Users size={18} />
                        Tableau de bord
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="relative mt-2 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 dark:text-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <Bell size={18} />
                        Notifications
                        {unreadNotifications > 0 && (
                          <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                            {unreadNotifications}
                          </span>
                        )}
                      </Link>
                      {isCitizen && (
                        <Link
                          href="/profil"
                          onClick={() => setIsOpen(false)}
                          className="mt-2 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 dark:text-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                          <UserRound size={18} />
                          Profil
                        </Link>
                      )}
                      <Link
                        href="/auth/logout"
                        onClick={() => setIsOpen(false)}
                        className="mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-rose-700 transition shadow-lg"
                      >
                        <LogOut size={18} />
                        Déconnexion
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-green-200 text-green-700 dark:text-green-300 dark:border-green-800 rounded-xl font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                      >
                        <LogIn size={18} />
                        Se connecter
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsOpen(false)}
                        className="mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                      >
                        <UserPlus size={18} />
                        Inscription citoyen
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
