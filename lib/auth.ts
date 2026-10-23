import { type DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
      phone?: string | null;
      commune?: string | null;
      registryNumber?: string | null;
      nic?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string | null;
    phone?: string | null;
    commune?: string | null;
    registryNumber?: string | null;
    nic?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });

        if (!user || !user.isActive || user.status !== "ACTIVE") {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date(), onlineStatus: "ONLINE" },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role?.name ?? null,
          phone: user.phone,
          commune: user.commune,
          registryNumber: user.registryNumber,
          nic: user.nic,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.commune = user.commune;
        token.registryNumber = user.registryNumber;
        token.nic = user.nic;
      } else if (typeof token.id === "string" && token.id) {
        // Re-check account state and role whenever a JWT session is read so
        // suspension or role changes take effect without waiting for expiry.
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            commune: true,
            registryNumber: true,
            nic: true,
            isActive: true,
            status: true,
            role: { select: { name: true } },
          },
        });

        if (!currentUser || !currentUser.isActive || currentUser.status !== "ACTIVE") {
          token.id = "";
          token.role = null;
          token.phone = null;
          token.commune = null;
          token.registryNumber = null;
          token.nic = null;
          token.name = null;
          token.email = null;
        } else {
          token.id = currentUser.id;
          token.role = currentUser.role?.name ?? null;
          token.phone = currentUser.phone;
          token.commune = currentUser.commune;
          token.registryNumber = currentUser.registryNumber;
          token.nic = currentUser.nic;
          token.name = `${currentUser.firstName} ${currentUser.lastName}`;
          token.email = currentUser.email;
        }
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.phone = session.user.phone ?? token.phone;
        token.commune = session.user.commune ?? token.commune;
        token.registryNumber = session.user.registryNumber ?? token.registryNumber;
        token.nic = session.user.nic ?? token.nic;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | null;
        session.user.phone = token.phone as string | null;
        session.user.commune = token.commune as string | null;
        session.user.registryNumber = token.registryNumber as string | null;
        session.user.nic = token.nic as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
