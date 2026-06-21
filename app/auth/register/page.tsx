"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message || "Impossible de créer le compte");
        setLoading(false);
        return;
      }

      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        router.push("/auth/login");
        return;
      }

      router.push("/demandes/nouvelle");
      router.refresh();
    } catch (err) {
      setError("Une erreur est survenue pendant l'inscription");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950" />

      <Link
        href="/auth/login"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-gray-700/40 dark:bg-gray-900/70 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <ArrowLeft size={16} />
        Retour connexion
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <div className="glass-effect rounded-3xl border border-white/20 p-8 shadow-2xl dark:border-gray-700/30">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inscription citoyen
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Créez votre compte pour déposer et suivre vos demandes en ligne.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" error={errors.firstName?.message}>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register("firstName")} className="input-modern w-full pl-10" placeholder="Prénom" />
              </Field>
              <Field label="Nom" error={errors.lastName?.message}>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register("lastName")} className="input-modern w-full pl-10" placeholder="Nom" />
              </Field>
            </div>

            <Field label="Email" error={errors.email?.message}>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" {...register("email")} className="input-modern w-full pl-10" placeholder="votre@email.com" />
            </Field>

            <Field label="Téléphone" error={errors.phone?.message}>
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input {...register("phone")} className="input-modern w-full pl-10" placeholder="+221 ..." />
            </Field>

            <Field label="Mot de passe" error={errors.password?.message}>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="input-modern w-full pl-10 pr-12"
                placeholder="Au moins 6 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 font-semibold text-white shadow-lg transition hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Création en cours..." : "Créer mon compte citoyen"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white/70 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <p>
                Les comptes agents et administrateurs ne sont pas ouverts au public.
                Ils sont créés depuis l'espace d'administration.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <span className="relative block">{children}</span>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
