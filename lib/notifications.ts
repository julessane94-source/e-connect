import prisma from "@/lib/prisma";

type NotificationInput = {
  userId?: string | null;
  title: string;
  message: string;
  type?: string;
  href?: string;
};

export async function notifyUser(input: NotificationInput) {
  if (!input.userId) return null;
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || "INFO",
      href: input.href,
    },
  });
}

export async function notifyStaff(input: Omit<NotificationInput, "userId">) {
  const users = await prisma.user.findMany({
    where: { roleId: { not: null }, isActive: true },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title: input.title,
      message: input.message,
      type: input.type || "INFO",
      href: input.href,
    })),
  });
}
