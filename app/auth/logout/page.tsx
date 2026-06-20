"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, LogOut, ArrowLeft, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function LogoutPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      await signOut({ redirect: false });
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 3000);
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 dark:bg-green-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 dark:bg-emerald-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "2s" }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 dark:bg-teal-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "4s" }}></div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 400, damping: 30 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-effect rounded-3xl shadow-2xl p-8 text-center border border-white/20 dark:border-gray-700/30">
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <Loader2 className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">
                Déconnexion en cours...
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Veuillez patienter un instant
              </p>
              <div className="mt-4 flex justify-center">
                <motion.div
                  className="flex gap-1"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" style={{ animationDelay: "0.3s" }}></span>
                  <span className="w-2 h-2 bg-teal-500 rounded-full" style={{ animationDelay: "0.6s" }}></span>
                </motion.div>
              </div>
            </>
          ) : success ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-20 h-20 mx-auto rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">
                Déconnexion réussie ! 👋
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Vous avez été déconnecté avec succès
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Redirection automatique dans quelques secondes...
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/auth/login"
                  className="block w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    <LogOut size={18} />
                    Se reconnecter
                  </span>
                </Link>
                <Link
                  href="/"
                  className="block w-full py-3 bg-white/80 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Home size={18} />
                    Retour à l'accueil
                  </span>
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
