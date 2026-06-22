"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ChevronLeft } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const load = async () => {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setNotifications(data.notifications ?? []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    await load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Demandes, assignations et statuts.</p>
          </div>
        </div>
        <button onClick={markAllRead} className="btn-secondary inline-flex items-center gap-2">
          <CheckCheck size={18} />
          Tout lire
        </button>
      </div>

      <div className="card-modern divide-y divide-gray-100 overflow-hidden dark:divide-gray-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune notification.</div>
        ) : (
          notifications.map((item) => (
            <Link
              key={item.id}
              href={item.href || "/dashboard"}
              className={`flex gap-4 p-5 transition hover:bg-gray-50 dark:hover:bg-gray-900 ${item.readAt ? "" : "bg-green-50/70 dark:bg-green-900/10"}`}
            >
              <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                <Bell className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                  {!item.readAt && <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">Nouveau</span>}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.message}</p>
                <p className="mt-2 text-xs text-gray-400">{new Date(item.createdAt).toLocaleString("fr-FR")}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
