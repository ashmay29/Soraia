import { ObjectId, type Filter } from "mongodb";
import { paymentLinks } from "./db";
import { approvalThresholdPaise, linkTtlHours } from "./config";
import { generateLinkToken } from "./icici/format";
import type { CreateLinkInput, PaymentLink } from "./types";
import type { SessionUser } from "./session";

export function expiryFrom(date = new Date()): Date {
  return new Date(date.getTime() + linkTtlHours() * 60 * 60 * 1000);
}

/**
 * Creates a payment link. The amount comes from the server-validated input, never
 * from anything the browser can restate later — the pay page reads it from here.
 *
 * Links over the approval threshold are created inactive and cannot be paid until an
 * admin approves. Admin-created links skip approval at any amount.
 */
export async function createLink(user: SessionUser, input: CreateLinkInput): Promise<PaymentLink> {
  const needsApproval = user.role !== "admin" && input.amountPaise > approvalThresholdPaise();

  const now = new Date();
  const doc: PaymentLink = {
    token: generateLinkToken(),
    amountPaise: input.amountPaise,
    description: input.description,
    customer: input.customer,
    status: needsApproval ? "pending_approval" : "active",
    createdBy: new ObjectId(user.id),
    // Only set once the link is actually payable; approval sets it otherwise.
    ...(needsApproval ? {} : { expiresAt: expiryFrom(now) }),
    attempts: [],
    createdAt: now,
    updatedAt: now,
  };

  const col = await paymentLinks();
  const { insertedId } = await col.insertOne(doc);
  return { ...doc, _id: insertedId };
}

/** Staff see only their own links. Admin sees everything. */
export async function listLinks(user: SessionUser, limit = 50): Promise<PaymentLink[]> {
  const col = await paymentLinks();
  const filter: Filter<PaymentLink> =
    user.role === "admin" ? {} : { createdBy: new ObjectId(user.id) };
  return col.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function listPendingApproval(): Promise<PaymentLink[]> {
  const col = await paymentLinks();
  return col.find({ status: "pending_approval" }).sort({ createdAt: 1 }).toArray();
}

export async function getLinkById(id: string): Promise<PaymentLink | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await paymentLinks();
  return col.findOne({ _id: new ObjectId(id) });
}

/**
 * Cancel an unpaid link. Ownership and status are both enforced in the query filter
 * rather than by reading first — that closes the gap where a link is paid between
 * the read and the write.
 */
export async function cancelLink(user: SessionUser, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await paymentLinks();

  const filter: Filter<PaymentLink> = {
    _id: new ObjectId(id),
    status: { $in: ["pending_approval", "active"] }, // never cancel a paid link
    ...(user.role === "admin" ? {} : { createdBy: new ObjectId(user.id) }),
  };

  const res = await col.updateOne(filter, {
    $set: { status: "cancelled", updatedAt: new Date() },
  });
  return res.modifiedCount === 1;
}

/** Admin approval. Expiry starts now, not at creation. */
export async function approveLink(admin: SessionUser, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await paymentLinks();
  const now = new Date();

  const res = await col.updateOne(
    { _id: new ObjectId(id), status: "pending_approval" },
    {
      $set: {
        status: "active",
        approvedBy: new ObjectId(admin.id),
        approvedAt: now,
        expiresAt: expiryFrom(now),
        updatedAt: now,
      },
    }
  );
  return res.modifiedCount === 1;
}

export async function rejectLink(admin: SessionUser, id: string, reason: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await paymentLinks();

  const res = await col.updateOne(
    { _id: new ObjectId(id), status: "pending_approval" },
    {
      $set: {
        status: "rejected",
        approvedBy: new ObjectId(admin.id),
        approvedAt: new Date(),
        rejectedReason: reason,
        updatedAt: new Date(),
      },
    }
  );
  return res.modifiedCount === 1;
}

/** True when a link is currently payable. The pay page must not rely on status alone. */
export function isPayable(link: PaymentLink, now = new Date()): boolean {
  if (link.status !== "active") return false;
  if (link.expiresAt && link.expiresAt.getTime() <= now.getTime()) return false;
  return true;
}
