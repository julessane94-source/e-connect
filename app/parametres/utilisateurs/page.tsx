"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search, Users } from "lucide-react";
import Link from "next/link";

type UserItem = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  department: string;
  status: string;
  isActive: boolean;
  createdAt: string;
};

export default function Utilisateurs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await fetch("/api/users", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users ?? []);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.role} ${user.department}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/parametres" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Vue administrateur de tous les citoyens, agents et administrateurs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Total utilisateurs" value={users.length} />
        <Stat label="Agents/Admin" value={users.filter((user) => user.role !== "CITOYEN").length} />
        <Stat label="Citoyens" value={users.filter((user) => user.role === "CITOYEN").length} />
      </div>

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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Département</th>
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
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{user.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.department}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.isActive ? "Actif" : "Inactif"}
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
