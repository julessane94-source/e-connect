import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type WaveCheckout = {
  id: string;
  amount: string | number;
  currency: string;
  checkout_status: "open" | "complete" | "expired";
  payment_status: string;
  transaction_id?: string | null;
  wave_launch_url?: string;
};

async function getWaveCheckout(apiKey: string, sessionId: string): Promise<WaveCheckout | null> {
  const response = await fetch(`https://api.wave.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

async function confirmExactPayment(request: {
  id: string;
  reference: string;
  citizenId: string;
  citizenName: string;
  paymentStatus: string;
  paymentSessionId: string | null;
  price: number;
}, checkout: WaveCheckout) {
  if (
    checkout.checkout_status !== "complete" ||
    checkout.payment_status !== "succeeded" ||
    checkout.currency !== "XOF" ||
    String(checkout.amount) !== String(request.price)
  ) {
    return { paid: false, mismatch: String(checkout.amount) !== String(request.price) };
  }

  if (request.paymentStatus === "PAID") return { paid: true };

  const result = await prisma.citizenRequest.updateMany({
    where: {
      id: request.id,
      citizenId: request.citizenId,
      paymentStatus: "PENDING",
      paymentSessionId: request.paymentSessionId,
      price: request.price,
    },
    data: {
      paymentStatus: "PAID",
      paymentAmount: request.price,
      paymentTransactionId: checkout.transaction_id || null,
    },
  });

  if (result.count === 0) {
    const latest = await prisma.citizenRequest.findUnique({
      where: { id: request.id },
      select: { paymentStatus: true, paymentTransactionId: true },
    });
    return { paid: latest?.paymentStatus === "PAID" };
  }

  await prisma.requestEvent.create({
    data: {
      requestId: request.id,
      action: "Paiement Wave confirmé",
      actorName: request.citizenName || "Citoyen",
      note: `Montant exact vérifié : ${request.price} FCFA${checkout.transaction_id ? ` · Transaction ${checkout.transaction_id}` : ""}.`,
    },
  });

  await notifyUser({
    userId: request.citizenId,
    title: "Paiement confirmé",
    message: `Le paiement exact de ${request.price} FCFA pour ${request.reference} a été confirmé.`,
    type: "PAYMENT",
    href: "/demandes/suivi",
  });

  return { paid: true };
}

async function loadCitizenRequest(id: string, userId: string) {
  return prisma.citizenRequest.findFirst({
    where: { id, citizenId: userId },
    select: {
      id: true,
      reference: true,
      citizenId: true,
      citizenName: true,
      price: true,
      paymentMethod: true,
      paymentStatus: true,
      paymentSessionId: true,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Connectez-vous pour régler cette demande." }, { status: 401 });
  }

  const apiKey = process.env.WAVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Le paiement Wave n’est pas encore configuré pour la plateforme." }, { status: 503 });
  }

  const citizenRequest = await loadCitizenRequest(params.id, session.user.id);
  if (!citizenRequest) {
    return NextResponse.json({ message: "Demande introuvable." }, { status: 404 });
  }
  if (citizenRequest.paymentStatus === "PAID") {
    return NextResponse.json({ message: "Cette demande est déjà payée.", paid: true }, { status: 409 });
  }
  if (citizenRequest.paymentMethod !== "REMOTE" || citizenRequest.price <= 0) {
    return NextResponse.json({ message: "Cette demande ne peut pas être réglée en ligne." }, { status: 400 });
  }

  if (citizenRequest.paymentSessionId) {
    const currentCheckout = await getWaveCheckout(apiKey, citizenRequest.paymentSessionId);
    if (!currentCheckout) {
      return NextResponse.json({ message: "Impossible de vérifier la session Wave existante. Réessayez." }, { status: 502 });
    }
    const confirmation = await confirmExactPayment(citizenRequest, currentCheckout);
    if (confirmation.paid) {
      return NextResponse.json({ paid: true });
    }
    if (confirmation.mismatch) {
      return NextResponse.json({ message: "Le montant versé ne correspond pas au montant exact de la demande. Le paiement n’a pas été confirmé." }, { status: 409 });
    }
    if (currentCheckout.checkout_status === "open" && currentCheckout.wave_launch_url) {
      return NextResponse.json({ waveLaunchUrl: currentCheckout.wave_launch_url });
    }
  }

  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) {
    return NextResponse.json({ message: "L’adresse publique du site n’est pas configurée." }, { status: 503 });
  }

  let origin: URL;
  try {
    origin = new URL(appUrl);
  } catch {
    return NextResponse.json({ message: "L’adresse publique du site est invalide." }, { status: 503 });
  }
  if (origin.protocol !== "https:" && origin.hostname !== "localhost") {
    return NextResponse.json({ message: "L’adresse publique du site doit utiliser HTTPS." }, { status: 503 });
  }

  const successUrl = new URL("/demandes/suivi", origin);
  successUrl.searchParams.set("paymentRequest", citizenRequest.id);
  const errorUrl = new URL("/demandes/suivi", origin);
  errorUrl.searchParams.set("paymentRequest", citizenRequest.id);
  errorUrl.searchParams.set("payment", "cancelled");

  const waveResponse = await fetch("https://api.wave.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(citizenRequest.price),
      currency: "XOF",
      client_reference: citizenRequest.reference,
      success_url: successUrl.toString(),
      error_url: errorUrl.toString(),
    }),
    cache: "no-store",
  });

  const checkout = await waveResponse.json().catch(() => null) as WaveCheckout | null;
  if (!waveResponse.ok || !checkout?.id || !checkout.wave_launch_url) {
    return NextResponse.json({ message: "Wave n’a pas pu créer le paiement. Réessayez ultérieurement." }, { status: 502 });
  }

  const saved = await prisma.citizenRequest.updateMany({
    where: {
      id: citizenRequest.id,
      citizenId: session.user.id,
      paymentStatus: "PENDING",
      price: citizenRequest.price,
    },
    data: { paymentSessionId: checkout.id },
  });
  if (saved.count !== 1) {
    await fetch(`https://api.wave.com/v1/checkout/sessions/${encodeURIComponent(checkout.id)}/expire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
    }).catch(() => undefined);
    return NextResponse.json({ message: "La demande a changé pendant la création du paiement. Actualisez la page et réessayez." }, { status: 409 });
  }

  return NextResponse.json({ waveLaunchUrl: checkout.wave_launch_url });
}

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Connectez-vous pour vérifier le paiement." }, { status: 401 });
  }

  const apiKey = process.env.WAVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Le paiement Wave n’est pas encore configuré pour la plateforme." }, { status: 503 });
  }

  const citizenRequest = await loadCitizenRequest(params.id, session.user.id);
  if (!citizenRequest) {
    return NextResponse.json({ message: "Demande introuvable." }, { status: 404 });
  }
  if (citizenRequest.paymentStatus === "PAID") {
    return NextResponse.json({ paid: true });
  }
  if (!citizenRequest.paymentSessionId) {
    return NextResponse.json({ message: "Aucune session de paiement n’est associée à cette demande." }, { status: 409 });
  }

  const checkout = await getWaveCheckout(apiKey, citizenRequest.paymentSessionId);
  if (!checkout) {
    return NextResponse.json({ message: "Wave n’a pas pu confirmer le paiement. Réessayez." }, { status: 502 });
  }
  const confirmation = await confirmExactPayment(citizenRequest, checkout);
  if (confirmation.paid) return NextResponse.json({ paid: true });
  if (confirmation.mismatch) {
    return NextResponse.json({ message: "Le montant reçu ne correspond pas au montant exact de la demande. Le paiement est rejeté." }, { status: 409 });
  }
  return NextResponse.json({ message: "Le paiement n’est pas encore confirmé par Wave." }, { status: 409 });
}
