// lib/validations/etat-civil.ts
import { z } from "zod";

export const birthSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  birthPlace: z.string().min(1, "Le lieu de naissance est requis"),
  gender: z.string().min(1, "Le sexe est requis"),
  fatherName: z.string().min(1, "Le nom du père est requis"),
  motherName: z.string().min(1, "Le nom de la mère est requis"),
  fatherProfession: z.string().optional(),
  motherProfession: z.string().optional(),
  address: z.string().optional(),
  declarantName: z.string().min(1, "Le nom du déclarant est requis"),
  declarantRelation: z.string().min(1, "La relation est requise"),
  witness1: z.string().optional(),
  witness2: z.string().optional(),
});

export const marriageSchema = z.object({
  husbandName: z.string().min(1, "Le nom du marié est requis"),
  husbandFirstName: z.string().min(1, "Le prénom du marié est requis"),
  husbandBirthDate: z.string().min(1, "La date de naissance du marié est requise"),
  husbandBirthPlace: z.string().min(1, "Le lieu de naissance du marié est requis"),
  wifeName: z.string().min(1, "Le nom de la mariée est requis"),
  wifeFirstName: z.string().min(1, "Le prénom de la mariée est requis"),
  wifeBirthDate: z.string().min(1, "La date de naissance de la mariée est requise"),
  wifeBirthPlace: z.string().min(1, "Le lieu de naissance de la mariée est requis"),
  marriageDate: z.string().min(1, "La date de mariage est requise"),
  marriagePlace: z.string().min(1, "Le lieu de mariage est requis"),
});

export const deathSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  deathDate: z.string().min(1, "La date de décès est requise"),
  deathPlace: z.string().min(1, "Le lieu de décès est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  birthPlace: z.string().min(1, "Le lieu de naissance est requis"),
  cause: z.string().optional(),
  declarantName: z.string().min(1, "Le nom du déclarant est requis"),
  declarantRelation: z.string().min(1, "La relation est requise"),
});

export type BirthInput = z.infer<typeof birthSchema>;
export type MarriageInput = z.infer<typeof marriageSchema>;
export type DeathInput = z.infer<typeof deathSchema>;
