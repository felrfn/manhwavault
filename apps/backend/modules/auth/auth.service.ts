import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signJwt } from "../../utils/jwt";

export async function registerUser(
  username: string,
  password: string,
  displayName?: string,
) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("USERNAME_TAKEN");
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, displayName },
  });
  return { id: user.id, username: user.username };
}

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error("INVALID_CREDENTIALS");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");
  const token = signJwt({ sub: user.id });
  return { token };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("NOT_FOUND");
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}
