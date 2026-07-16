import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Données collectées",
    text: "Sedhiou-connect collecte les informations nécessaires à la création du compte citoyen et au traitement des demandes : identité, email, téléphone, commune, numéro de registre, date de naissance, pièces jointes et informations liées aux dossiers déposés.",
  },
  {
    title: "Utilisation des données",
    text: "Ces données servent uniquement à identifier le citoyen, créer son NIC, suivre ses demandes, notifier l'évolution des dossiers et permettre aux services communaux compétents de traiter les démarches.",
  },
  {
    title: "Protection et accès",
    text: "L'accès aux données est limité aux agents habilités selon leur rôle. Les comptes administratifs et communaux doivent utiliser des accès sécurisés et ne doivent pas partager les informations des citoyens.",
  },
  {
    title: "Conservation",
    text: "Les données sont conservées pendant la durée nécessaire au suivi administratif, à la traçabilité des dossiers et au respect des obligations de gestion municipale.",
  },
  {
    title: "Droits du citoyen",
    text: "Chaque citoyen peut demander la consultation, la correction ou la mise à jour de ses informations en contactant la mairie ou l'équipe de gestion de la plateforme.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'inscription
        </Link>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-slate-950 p-8 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-cyan-200">Sedhiou-connect</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Politique de confidentialité</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Cette politique explique comment les informations des citoyens sont utilisées pour les services municipaux numériques.
            </p>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            {sections.map((section) => (
              <article key={section.title} className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <LockKeyhole className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.text}</p>
              </article>
            ))}

            <div className="rounded-xl bg-cyan-50 p-5 text-sm leading-6 text-cyan-950 dark:bg-cyan-950/30 dark:text-cyan-100">
              Pour toute demande liée à vos données personnelles, contactez la mairie ou utilisez les informations de contact affichées sur la plateforme.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
