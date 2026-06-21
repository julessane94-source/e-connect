import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalUsers, agents, citizens, departments] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { roleId: { not: null } } }),
      prisma.user.count({ where: { roleId: null } }),
      prisma.department.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      agents,
      citizens,
      departments,
      services: 6,
    });
  } catch (error) {
    return NextResponse.json(
      {
        totalUsers: 0,
        agents: 0,
        citizens: 0,
        departments: 0,
        services: 6,
      },
      { status: 200 }
    );
  }
}
