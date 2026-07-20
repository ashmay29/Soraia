import type { ObjectId } from "mongodb";
import { z } from "zod";

// ── roles & status ────────────────────────────────────────────────────────────

export type Role = "staff" | "admin";

export type LinkStatus =
  | "pending_approval"
  | "active"
  | "rejected"
  | "paid"
  | "expired"
  | "cancelled";

export type AttemptStatus = "pending" | "paid" | "failed" | "reversed" | "expired";

// ── documents ─────────────────────────────────────────────────────────────────

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
}

export interface PaymentAttempt {
  merchantTxnNo: string;
  status: AttemptStatus;
  /** Snapshot of the link amount when this attempt began. Never trust a callback's amount. */
  expectedAmountPaise: number;
  paidAmountPaise?: number;
  txnId?: string;
  paymentMode?: string;
  paymentDateTime?: Date;
  /** From settlement advice — when the money actually reaches the merchant account. */
  settlementId?: string;
  settlementStatus?: string;
  settlementDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentLink {
  _id?: ObjectId;
  /** Public URL secret. Unguessable — it is the only thing protecting the pay page. */
  token: string;
  amountPaise: number;
  description: string;
  customer: { name?: string; phone?: string; email?: string };
  status: LinkStatus;
  createdBy: ObjectId;
  approvedBy?: ObjectId;
  approvedAt?: Date;
  rejectedReason?: string;
  /** Set when the link becomes active — the clock starts at approval, not creation. */
  expiresAt?: Date;
  paidAt?: Date;
  attempts: PaymentAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GatewayEvent {
  _id?: ObjectId;
  merchantTxnNo: string;
  source: "return" | "advice" | "settlement" | "status_check";
  /** The raw callback, stored untouched. The only thing that settles a dispute later. */
  payload: Record<string, unknown>;
  receivedAt: Date;
}

// ── validation ────────────────────────────────────────────────────────────────

/** ₹0.01 to ₹9,99,99,999.99 — ICICI allows 9 significant digits and 2 decimals. */
export const amountPaiseSchema = z
  .number()
  .int("Amount must be in whole paise")
  .positive("Amount must be greater than zero")
  .max(99999999999, "Amount exceeds the 9-digit limit");

export const createLinkSchema = z.object({
  amountPaise: amountPaiseSchema,
  description: z.string().trim().min(1, "Description is required").max(200),
  customer: z.object({
    name: z.string().trim().max(45).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10,13}$/, "Phone must be 10-13 digits")
      .optional(),
    email: z.email().max(48).optional(),
  }),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});
