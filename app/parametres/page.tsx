import Link from "next/link";
import { BarChart3, Building2, ClipboardList, Settings, Shield, Users } from "lucide-react";

const adminSections = [
  {
    title: "Utilisateurs",
    description: "Créer les comptes agents et gérer les accès.",
    href: "/parametres/utilisateurs",
    icon: Users,
  },
  {
    title: "Rôles",
    description: "Définir les niveaux d'autorisation des agents.",
    href: "/parametres/roles",
    icon: Shield,
  },
  {
    title: "Traitement des demandes",
    description: "Suivre, valider ou rejeter les demandes citoyennes.",
    href: "/demandes",
    icon: ClipboardList,
  },
  {
    title: "Types et tarifs",
    description: "Fixer le prix de chaque type de demande visible par les citoyens.",
    href: "/parametres/demandes",
    icon: Settings,
  },
  {
    title: "Mairie",
    description: "Modifier le nom, le contact et les coordonnées publiques.",
    href: "/parametres/mairie",
    icon: Building2,
  },
  {
    title: "Rapports",
    description: "Consulter les statistiques opérationnelles.",
    href: "/reporting",
    icon: BarChart3,
  },
];

export default function Parametres() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administration</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Tableau de bord administrateur pour piloter la plateforme Agent Connect.
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/15 p-3">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Espace réservé aux administrateurs</h2>
            <p className="mt-1 text-sm text-green-50">
              Les comptes agents sont créés ici. Les citoyens disposent uniquement de leur espace personnel.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {adminSections.map((section) => (
          <Link key={section.href} href={section.href} className="card-modern block p-6 transition hover:border-green-300 dark:hover:border-green-700">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                <section.icon className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
