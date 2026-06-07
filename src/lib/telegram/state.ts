import { prisma } from "@/lib/prisma/client";

export async function getSession(chatId: string) {
  let session = await prisma.telegramSession.findUnique({ where: { chat_id: chatId } });
  if (!session) {
    session = await prisma.telegramSession.create({
      data: { chat_id: chatId, state: "idle", data: {} },
    });
  }
  return session;
}

export async function setState(chatId: string, state: string, data: object = {}) {
  await prisma.telegramSession.upsert({
    where: { chat_id: chatId },
    update: { state, data },
    create: { chat_id: chatId, state, data },
  });
}

export async function clearState(chatId: string) {
  await setState(chatId, "idle", {});
}
