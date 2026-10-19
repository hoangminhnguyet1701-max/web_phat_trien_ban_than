import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { db } from "./db";
import { verifyPassword } from "./password";
import { cache } from "react";
import { allowLoginAttempt, clearLoginAttempts } from "./login-limit";
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          credentials.email.length > 254 ||
          !credentials.password ||
          credentials.password.length > 128
        )
          return null;
        const email = credentials.email.toLowerCase().trim();
        if (!(await allowLoginAttempt(email)))
          throw new Error("TooManyAttempts");
        const user = await db.user.findUnique({
          where: { email },
        });
        if (
          !user ||
          !(await verifyPassword(credentials.password, user.passwordHash))
        )
          return null;
        await clearLoginAttempts(email);
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
};
export const requireUser = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) redirect("/login");
  return user;
});
