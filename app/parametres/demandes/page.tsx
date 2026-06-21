"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";

type RequestType = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
};

export default function ParametresDemandes() {
  const [types, setTypes] = useState<RequestType[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadTypes = async () => {
    const response = await fetch("/api/request-types", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setTypes(data.types ?? []);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const updateType = async (type: RequestType) => {
    setSavingId(type.id);
    const response = await fetch("/api/request-types", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(type),
    });
    setSavingId(null);
    if (response.ok) await loadTypes();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/parametres" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Types et tarifs des demandes</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Ces montants sont visibles par les citoyens avant le dépôt de leur demande.
          </p>
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Prix FCFA</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <input
                      className="input-modern w-full"
                      value={type.name}
                      onChange={(event) => setTypes(types.map((item) => item.id === type.id ? { ...item, name: event.target.value } : item))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="input-modern w-full"
                      value={type.category}
                      onChange={(event) => setTypes(types.map((item) => item.id === type.id ? { ...item, category: event.target.value } : item))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      className="input-modern w-40"
                      value={type.price}
                      onChange={(event) => setTypes(types.map((item) => item.id === type.id ? { ...item, price: Number(event.target.value) } : item))}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-primary inline-flex items-center gap-2" onClick={() => updateType(type)} disabled={savingId === type.id}>
                      <Save size={16} />
                      {savingId === type.id ? "..." : "Enregistrer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
