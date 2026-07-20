import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { users } from "@/lib/db";
import { loginSchema, type Role } from "@/lib/types";

declare module "next-auth" {
  interface User {
    role: Role;
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }
}

/**
 * The JWT shape we put on the token. Declared locally rather than by augmenting
 * "next-auth/jwt": that module re-exports from "@auth/core", which pnpm does not
 * hoist, so the augmentation cannot resolve.
 */
interface AppToken {
  id: string;
  email?: string | null;
  role: Role;
  mustChangePassword: boolean;
}

/** A bcrypt hash of a throwaway value, used to equalise timing on unknown emails. */
const DUMMY_HASH = "$2b$12$........................................................";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Credentials requires JWT sessions — there is no database session to look up.
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8h, roughly one shift
  trustHost: true,
  pages: { signIn: "/staff/login" },
  logger: {
    error(error) {
      // A cookie signed with a previous AUTH_SECRET can't be decrypted. safeAuth()
      // already handles this as "signed out", so don't spew a stack trace for it.
      // Everything else is a real error and passes through.
      if (error?.message?.includes("no matching decryption secret")) return;
      console.error(error);
    },
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const col = await users();
        const user = await col.findOne({ email });

        // Always run a bcrypt comparison, even when the user does not exist, so an
        // attacker cannot distinguish valid emails by response time.
        const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !ok || !user.isActive) return null;

        return {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const t = token as unknown as AppToken;
      if (user) {
        t.id = user.id as string;
        t.role = user.role;
        t.mustChangePassword = user.mustChangePassword;
      }
      // After a password change the client calls update() so the forced-change flag
      // clears without needing a re-login.
      if (trigger === "update" && t.email) {
        const col = await users();
        const fresh = await col.findOne({ email: t.email });
        if (fresh) t.mustChangePassword = fresh.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as unknown as AppToken;
      session.user.id = t.id;
      session.user.role = t.role;
      session.user.mustChangePassword = t.mustChangePassword;
      return session;
    },
  },
});
