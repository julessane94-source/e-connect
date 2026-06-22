"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Mail, 
  MapPin, 
  Clock,
  ArrowUp
} from "lucide-react";

export default function Footer() {
  const [profile, setProfile] = useState({
    name: "Agent Connect",
    address: "Sédhiou, Sénégal",
    email: "contact@agent-connect.sn",
    phone: "",
    openingHours: "Lun - Ven: 8h - 17h",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const response = await fetch("/api/municipality", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setProfile({
        name: data.profile.name || "Agent Connect",
        address: data.profile.address || "Sédhiou, Sénégal",
        email: data.profile.email || "contact@agent-connect.sn",
        phone: data.profile.phone || "",
        openingHours: data.profile.openingHours || "Lun - Ven: 8h - 17h",
      });
    };

    loadProfile();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-xl font-bold mb-4">??? {profile.name}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plateforme de digitalisation des services municipaux de Sédhiou.
              Simplifiez la gestion administrative des communes de la région.
            </p>
            <p className="text-gray-500 text-xs mt-4">
              Conçu par Souleymane Sane (AT-TIDIANY).
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white transition">Accueil</Link></li>
              <li><Link href="/historique" className="text-gray-400 hover:text-white transition">Historique</Link></li>
              <li><Link href="/a-propos" className="text-gray-400 hover:text-white transition">À propos</Link></li>
              <li><Link href="/nos-services" className="text-gray-400 hover:text-white transition">Nos services</Link></li>
              <li><Link href="/espace-maires" className="text-gray-400 hover:text-white transition">Espace des maires</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span>{profile.address}</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Mail size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                <a href={`mailto:${profile.email}`} className="hover:text-white transition">{profile.email}</a>
              </li>
              {profile.phone && (
                <li className="flex items-start gap-3 text-gray-400">
                  <Mail size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <a href={`tel:${profile.phone}`} className="hover:text-white transition">{profile.phone}</a>
                </li>
              )}
              <li className="flex items-start gap-3 text-gray-400">
                <Clock size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span>{profile.openingHours}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-3">
              Recevez nos actualités et mises à jour
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder:text-gray-500"
              />
              <a href={`mailto:${profile.email}`} className="px-4 py-2 text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition">
                Nous contacter
              </a>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 Agent Connect. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/auth/register" className="text-sm text-gray-400 hover:text-white transition">Inscription citoyen</Link>
            <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition">Connexion agents</Link>
          </div>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition"
          >
            <ArrowUp size={18} className="text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
}
