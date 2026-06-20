"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Save, XCircle, Upload } from "lucide-react";
import Link from "next/link";

export default function NouvelleNaissance() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    gender: "",
    fatherName: "",
    motherName: "",
    declarantName: "",
    declarantRelation: "",
    witness1: "",
    witness2: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Acte de naissance enregistré avec succès!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/etat-civil/naissances" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">👶 Nouvel acte de naissance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Enregistrer un nouvel acte de naissance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-modern p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Prénom *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input-modern w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nom *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input-modern w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Date de naissance *
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="input-modern w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Lieu de naissance *
            </label>
            <input
              type="text"
              name="birthPlace"
              value={formData.birthPlace}
              onChange={handleChange}
              className="input-modern w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Sexe *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-modern w-full"
              required
            >
              <option value="">Sélectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nom du père *
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="input-modern w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nom de la mère *
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              className="input-modern w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Déclarant *
            </label>
            <input
              type="text"
              name="declarantName"
              value={formData.declarantName}
              onChange={handleChange}
              className="input-modern w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Lien avec l'enfant *
            </label>
            <select
              name="declarantRelation"
              value={formData.declarantRelation}
              onChange={handleChange}
              className="input-modern w-full"
              required
            >
              <option value="">Sélectionner</option>
              <option value="Père">Père</option>
              <option value="Mère">Mère</option>
              <option value="Tuteur">Tuteur</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Témoin 1
            </label>
            <input
              type="text"
              name="witness1"
              value={formData.witness1}
              onChange={handleChange}
              className="input-modern w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Témoin 2
            </label>
            <input
              type="text"
              name="witness2"
              value={formData.witness2}
              onChange={handleChange}
              className="input-modern w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={18} />
            Enregistrer
          </button>
          <button type="reset" className="btn-secondary flex items-center gap-2">
            <XCircle size={18} />
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
