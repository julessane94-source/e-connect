"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, LogIn, AlertCircle, Sparkles, Building2, Shield, Users, UserPlus } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Schéma de validation avec Zod
const loginSchema = z.object({
  email: z.string().email("Email invalide").min(1, "Email requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const features = [
    { icon: Shield, label: "Sécurisé", color: "text-blue-500" },
    { icon: Users, label: "Collaboratif", color: "text-green-500" },
    { icon: Building2, label: "Moderne", color: "text-purple-500" },
    { icon: Sparkles, label: "Intelligent", color: "text-orange-500" },
  ];

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
      } else {
        const session = await getSession();
        router.push(session?.user?.role ? "/dashboard" : "/demandes/nouvelle");
        router.refresh();
      }
    } catch (error) {
      setError("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond animé avec gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 dark:bg-green-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 dark:bg-emerald-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "2s" }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 dark:bg-teal-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "4s" }}></div>
        </div>
      </div>

      {/* Contenu principal */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-gray-700/40 dark:bg-gray-900/70 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Retour à l'accueil
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 400, damping: 30 }}
        className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center"
      >
        {/* Colonne gauche - Informations */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                <span className="text-5xl">🏛️</span>
              </div>
            </motion.div>

            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Agent
                <span className="gradient-text">Connect</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                Accès sécurisé pour les agents municipaux et les citoyens inscrits.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-white/20 dark:border-gray-700/30"
                >
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{feature.label}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Service disponible 24/7</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Un espace citoyen et agent</p>
                <p className="text-xs text-gray-400">Les comptes agents sont créés par l'administration</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Colonne droite - Formulaire */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30">
            {/* En-tête du formulaire */}
            <div className="text-center mb-8">
              <div className="lg:hidden mb-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <span className="text-3xl">🏛️</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bienvenue
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Connectez-vous à votre espace sécurisé
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} strokeWidth={1.8} />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="votre@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 dark:text-white placeholder:text-gray-400 ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} strokeWidth={1.8} />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 bg-white/80 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 dark:text-white placeholder:text-gray-400 ${
                      errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                  />
                  Se souvenir de moi
                </label>
                <a href="mailto:contact@agent-connect.sn" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition font-medium text-sm">
                  Mot de passe oublié ?
                </a>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn size={18} strokeWidth={2} />
                    Se connecter
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                Vous êtes citoyen ?
              </p>
              <Link
                href="/auth/register"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-100 dark:bg-gray-900 dark:text-green-300 dark:hover:bg-gray-800"
              >
                <UserPlus size={16} />
                Créer un compte citoyen
              </Link>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Les comptes agents sont créés uniquement par l'administrateur.
              </p>
            </div>

            <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
              <p>© 2024 Agent Connect - Tous droits réservés</p>
              <p className="mt-1">Version 1.0.0</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
