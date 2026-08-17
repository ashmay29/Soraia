"use server";

import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { safeAuth } from "@/lib/session";
import { users } from "@/lib/db";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(200)
      .refine((v) => !/^\s|\s$/.test(v), "Cannot start or end with a space"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "The two passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Choose a different password from your current one",
    path: ["newPassword"],
  });

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await safeAuth();
  if (!session?.user) return { error: "Your session has expired. Please sign in again." };

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const col = await users();
  const user = await col.findOne({ _id: new ObjectId(session.user.id) });
  if (!user) return { error: "Account not found." };

  // Re-verify the current password: a hijacked session must not be able to lock
  // the real owner out by changing it.
  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { error: "Your current password is incorrect." };

  await col.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash: await bcrypt.hash(parsed.data.newPassword, 12),
        mustChangePassword: false,
      },
    }
  );

  return { success: true };
}
