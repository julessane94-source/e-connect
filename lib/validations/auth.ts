// Validation partagée pour les formulaires d'authentification.
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalide").max(254, "Email trop long").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(72, "Mot de passe trop long"),
});

export const registerSchema = z.object({
  email: z.string().trim().email("Email invalide").max(254, "Email trop long").transform((value) => value.toLowerCase()),
  password: z.string()
    .min(12, "Choisissez un mot de passe d'au moins 12 caractères")
    .max(72, "Mot de passe trop long (72 caractères maximum)"),
  firstName: z.string().trim().min(1, "Le prénom est requis").max(100, "Prénom trop long"),
  lastName: z.string().trim().min(1, "Le nom est requis").max(100, "Nom trop long"),
  phone: z.string().trim().max(30, "Numéro de téléphone trop long").optional(),
  registryNumber: z.string().trim().min(2, "Le numéro de registre est requis").max(64, "Numéro de registre trop long"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  commune: z.string().trim().min(1, "La commune est requise").max(100, "Commune invalide"),
  departmentId: z.string().optional(),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter la politique de confidentialité" }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
