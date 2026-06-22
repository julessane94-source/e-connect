"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Email invalide").min(1, "Email requis"),
  password: z.string().min(6, "Mot de passe requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Email ou mot de passe incorrect" : "Connexion impossible : vérifiez les variables Vercel et la base Supabase.");
        setLoading(false);
        return;
      }

      const session = await getSession();
      router.push(session?.user?.role ? "/dashboard" : "/demandes/nouvelle");
      router.refresh();
    } catch (error) {
      setError("Connexion impossible");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white">
      <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15">
        <ArrowLeft size={16} />
        Accueil
      </Link>

      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:block">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-tight">Connexion sécurisée</h1>
          <p className="mt-4 max-w-md text-lg text-slate-300">Citoyens, agents et administrateurs accèdent à leur espace dédié.</p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {["Demandes", "Paiement", "Retrait"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-semibold ring-1 ring-white/15">
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl bg-white p-7 text-slate-900 shadow-2xl">
          <div className="mb-7">
            <h2 className="text-2xl font-bold">Se connecter</h2>
            <p className="mt-1 text-sm text-slate-500">Accès AgentConnect</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email" error={errors.email?.message}>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" {...register("email")} className="input-modern w-full pl-10" placeholder="vous@email.com" />
            </Field>

            <Field label="Mot de passe" error={errors.password?.message}>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="input-modern w-full pl-10 pr-12"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
              <LogIn size={18} />
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-600">Pas encore de compte citoyen ?</p>
            <Link href="/auth/register" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <UserPlus size={16} />
              Inscription
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <span className="relative block">{children}</span>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
