import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalUsers, agents, citizens, departments, services] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { roleId: { not: null } } }),
      prisma.user.count({ where: { roleId: null } }),
      prisma.department.count(),
      prisma.requestType.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      totalUsers,
      agents,
      citizens,
      departments,
      services,
    });
  } catch {
    return NextResponse.json(
      { message: "Les statistiques sont temporairement indisponibles." },
      { status: 503 }
    );
  }
}
