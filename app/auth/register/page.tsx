"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, Calendar, Eye, EyeOff, Hash, Lock, Mail, MapPin, Phone, User, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sedhiouCommunes } from "@/lib/sedhiou";
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
      setError("Inscription impossible");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white">
      <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/15 transition hover:bg-white/15">
        <ArrowLeft size={16} />
        Connexion
      </Link>

      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:block">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/25">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-tight">Compte citoyen</h1>
          <p className="mt-4 max-w-md text-lg text-slate-300">Choisissez votre commune, déposez vos demandes et suivez vos dossiers.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl bg-white p-7 text-slate-900 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Inscription citoyen</h2>
            <p className="mt-1 text-sm text-slate-500">Votre NIC sera généré automatiquement.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" error={errors.firstName?.message}>
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input {...register("firstName")} className="input-modern w-full pl-10" placeholder="Prénom" />
            </Field>
            <Field label="Nom" error={errors.lastName?.message}>
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input {...register("lastName")} className="input-modern w-full pl-10" placeholder="Nom" />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" {...register("email")} className="input-modern w-full pl-10" placeholder="vous@email.com" />
            </Field>
            <Field label="Téléphone" error={errors.phone?.message}>
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input {...register("phone")} className="input-modern w-full pl-10" placeholder="+221 ..." />
            </Field>

            <Field label="Numéro de registre" error={errors.registryNumber?.message}>
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input {...register("registryNumber")} className="input-modern w-full pl-10" placeholder="REG-SED-..." />
            </Field>
            <Field label="Date de naissance" error={errors.birthDate?.message}>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="date" {...register("birthDate")} className="input-modern w-full pl-10" />
            </Field>

            <Field label="Commune" error={errors.commune?.message} wide>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select {...register("commune")} className="input-modern w-full pl-10">
                <option value="">Choisir votre commune</option>
                {sedhiouCommunes.map((commune) => (
                  <option key={`${commune.department}-${commune.name}`} value={commune.name}>
                    {commune.name} - {commune.department}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Mot de passe" error={errors.password?.message} wide>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="input-modern w-full pl-10 pr-12"
                placeholder="Au moins 6 caractères"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

            <button type="submit" disabled={loading} className="sm:col-span-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
              <UserPlus size={18} />
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  wide = false,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "block sm:col-span-2" : "block"}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <span className="relative block">{children}</span>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
