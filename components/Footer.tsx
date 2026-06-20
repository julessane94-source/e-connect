"use client";

import Link from "next/link";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  ArrowUp
} from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-xl font-bold mb-4">🏛️ Agent Connect</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plateforme de digitalisation des services municipaux au Sénégal.
              Simplifiez la gestion administrative de votre mairie.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Youtube size={20} />
              </a>
            </div>
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
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span>+221 33 123 45 67</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Mail size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span>contact@agent-connect.sn</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Clock size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span>Lun - Ven: 8h - 17h</span>
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
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2024 Agent Connect. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="text-sm text-gray-400 hover:text-white transition">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="text-sm text-gray-400 hover:text-white transition">
              Confidentialité
            </Link>
            <Link href="/cookies" className="text-sm text-gray-400 hover:text-white transition">
              Cookies
            </Link>
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
