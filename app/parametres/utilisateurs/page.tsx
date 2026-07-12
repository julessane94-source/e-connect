"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ChevronLeft, Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { sedhiouCommunes } from "@/lib/sedhiou";

type UserItem = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  department: string;
  commune?: string | null;
  registryNumber?: string | null;
  nic?: string | null;
  lastLogin?: string | null;
  onlineStatus?: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  role: "AGENT",
  departmentName: "Administration",
  departmentCode: "ADM",
  status: "ACTIVE",
  isActive: true,
  commune: "",
  registryNumber: "",
  birthDate: "",
};

export default function Utilisateurs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    const response = await fetch("/api/users", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setUsers(data.users ?? []);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.role} ${user.department} ${user.commune || ""} ${user.nic || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);
  const communeAccounts = useMemo(
    () => users.filter((user) => user.role === "AGENT" && user.commune && user.department.toLowerCase().startsWith("mairie de")),
    [users]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    const value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.message || "Impossible de créer l'utilisateur");
      setSaving(false);
      return;
    }

    setMessage(`Utilisateur créé : ${payload.user?.email || formData.email}`);
    setFormData(emptyForm);
    setSaving(false);
    await loadUsers();
  };

  const syncCommuneAccounts = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "syncCommuneAccounts" }),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(payload.message || "Impossible de créer les comptes communaux");
      return;
    }

    setMessage(`${payload.message}. Mot de passe initial : ${payload.password}`);
    await loadUsers();
  };

  const isCitizenForm = formData.role === "CITOYEN";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/parametres" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Création et suivi des citoyens, agents et administrateurs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label="Total utilisateurs" value={users.length} />
        <Stat label="Agents/Admin" value={users.filter((user) => user.role !== "CITOYEN").length} />
        <Stat label="Comptes communaux" value={communeAccounts.length} />
        <Stat label="Citoyens" value={users.filter((user) => user.role === "CITOYEN").length} />
      </div>

      <div className="card-modern flex flex-col gap-4 border-cyan-200 bg-cyan-50/60 p-5 dark:border-cyan-900/60 dark:bg-cyan-950/20 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-cyan-100 p-3 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Comptes de gestion des communes</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ces comptes reçoivent les dossiers transférés par la coordination et gèrent les demandes de leur commune.
            </p>
            <p className="mt-2 text-xs font-medium text-cyan-800 dark:text-cyan-300">
              Format : agent.nom.commune@agent-connect.sn / mot de passe initial commune123
            </p>
          </div>
        </div>
        <button type="button" onClick={syncCommuneAccounts} disabled={saving} className="btn-primary inline-flex items-center justify-center gap-2">
          <Building2 size={18} />
          {saving ? "Synchronisation..." : "Créer / synchroniser"}
        </button>
      </div>

      <form onSubmit={createUser} className="card-modern p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
            <UserPlus className="h-5 w-5 text-green-700 dark:text-green-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Créer un utilisateur</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Les agents sont créés par l'admin. Les citoyens peuvent aussi être créés ici si nécessaire.</p>
          </div>
        </div>

        {message && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Prénom">
            <input name="firstName" value={formData.firstName} onChange={handleChange} className="input-modern w-full" required />
          </Field>
          <Field label="Nom">
            <input name="lastName" value={formData.lastName} onChange={handleChange} className="input-modern w-full" required />
          </Field>
          <Field label="Email">
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-modern w-full" required />
          </Field>
          <Field label="Mot de passe">
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-modern w-full" required />
          </Field>
          <Field label="Téléphone">
            <input name="phone" value={formData.phone} onChange={handleChange} className="input-modern w-full" />
          </Field>
          <Field label="Rôle">
            <select name="role" value={formData.role} onChange={handleChange} className="input-modern w-full">
              <option value="AGENT">Agent</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
              <option value="CITOYEN">Citoyen</option>
            </select>
          </Field>
          {!isCitizenForm && (
            <>
              <Field label="Service">
                <input name="departmentName" value={formData.departmentName} onChange={handleChange} className="input-modern w-full" />
              </Field>
              <Field label="Code service">
                <input name="departmentCode" value={formData.departmentCode} onChange={handleChange} className="input-modern w-full" />
              </Field>
            </>
          )}
          <Field label="Statut">
            <select name="status" value={formData.status} onChange={handleChange} className="input-modern w-full">
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
              <option value="SUSPENDED">Suspendu</option>
            </select>
          </Field>
          <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4" />
            Connexion autorisée
          </label>
          <Field label="Commune">
            <select name="commune" value={formData.commune} onChange={handleChange} className="input-modern w-full" required={isCitizenForm}>
              <option value="">Non rattaché</option>
              {sedhiouCommunes.map((commune) => (
                <option key={`${commune.department}-${commune.name}`} value={commune.name}>
                  {commune.name} - {commune.department}
                </option>
              ))}
            </select>
          </Field>
          {isCitizenForm && (
            <>
              <Field label="Numéro de registre">
                <input name="registryNumber" value={formData.registryNumber} onChange={handleChange} className="input-modern w-full" required />
              </Field>
              <Field label="Date de naissance">
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-modern w-full" required />
              </Field>
            </>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary mt-5 inline-flex items-center gap-2 disabled:opacity-50">
          <UserPlus size={18} />
          {saving ? "Création..." : "Créer l'utilisateur"}
        </button>
      </form>

      <div className="card-modern p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="input-modern w-full pl-10"
          />
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Téléphone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Commune / NIC</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Activité</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.phone || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {user.role === "AGENT" && user.commune && user.department.toLowerCase().startsWith("mairie de") ? "COMPTE COMMUNE" : user.role}
                    <span className="block text-xs text-gray-400">{user.department}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {user.commune || "-"}
                    <span className="block text-xs text-gray-400">{user.nic || user.registryNumber || "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    <span className="block text-xs text-gray-400">
                      Dernière connexion : {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`mr-2 rounded-full px-2 py-1 text-xs font-medium ${
                      user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.isActive ? "Actif" : "Inactif"}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {user.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-modern p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
          <Users className="h-5 w-5 text-green-700 dark:text-green-300" />
        </div>
      </div>
    </div>
  );
}
