import { ObjectId } from "mongodb";
import ApprovalQueue, { type PendingRow } from "@/components/staff/ApprovalQueue";
import LinkList, { type LinkRow } from "@/components/staff/LinkList";
import StaffHeader from "@/components/staff/StaffHeader";
import { formatInr, payUrl } from "@/lib/config";
import { users } from "@/lib/db";
import { listLinks, listPendingApproval } from "@/lib/links";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin · Soraia" };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [pending, all] = await Promise.all([listPendingApproval(), listLinks(admin, 100)]);

  // One query for every creator referenced, rather than a lookup per row.
  const creatorIds = [...new Set([...pending, ...all].map((l) => l.createdBy.toString()))];
  const userCol = await users();
  const creators = await userCol
    .find({ _id: { $in: creatorIds.map((id) => new ObjectId(id)) } })
    .toArray();
  const nameById = new Map(creators.map((u) => [u._id!.toString(), u.name]));

  const pendingRows: PendingRow[] = pending.map((link) => ({
    id: link._id!.toString(),
    amount: formatInr(link.amountPaise),
    description: link.description,
    customerName: link.customer?.name,
    createdByName: nameById.get(link.createdBy.toString()) ?? "Unknown",
    createdAt: dateFmt.format(link.createdAt),
  }));

  const now = new Date();
  const allRows: LinkRow[] = await Promise.all(
    all.map(async (link) => ({
      id: link._id!.toString(),
      url: await payUrl(link.token),
      amount: formatInr(link.amountPaise),
      description: link.description,
      customerName: link.customer?.name,
      status: link.status,
      createdAt: `${dateFmt.format(link.createdAt)} · ${nameById.get(link.createdBy.toString()) ?? "Unknown"}`,
      expiresAt: link.expiresAt ? dateFmt.format(link.expiresAt) : undefined,
      isExpired: !!link.expiresAt && link.expiresAt.getTime() <= now.getTime(),
      rejectedReason: link.rejectedReason,
    }))
  );

  const paidCount = all.filter((l) => l.status === "paid").length;
  const paidTotal = all
    .filter((l) => l.status === "paid")
    .reduce((sum, l) => sum + l.amountPaise, 0);

  return (
    <div className="bg-background min-h-screen">
      <StaffHeader user={admin} pendingCount={pendingRows.length} />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-primary text-3xl tracking-tight italic md:text-4xl">
          Administration
        </h1>

        <dl className="border-primary/10 mt-8 grid grid-cols-2 gap-6 border-y py-6 sm:grid-cols-4">
          {[
            { label: "Awaiting approval", value: String(pendingRows.length) },
            { label: "Paid links", value: String(paidCount) },
            { label: "Total collected", value: formatInr(paidTotal) },
            { label: "All links", value: String(allRows.length) },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="text-primary/55 text-[10px] tracking-[0.2em] uppercase">
                {stat.label}
              </dt>
              <dd className="font-display text-primary mt-2 text-xl">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-12">
          <h2 className="font-display text-primary text-2xl tracking-tight italic">
            Approval queue
          </h2>
          <p className="text-primary/60 mt-2 mb-6 text-sm leading-relaxed font-light">
            These customers cannot pay until you approve.
          </p>
          <ApprovalQueue pending={pendingRows} />
        </section>

        <section className="mt-14">
          <h2 className="font-display text-primary text-2xl tracking-tight italic">
            All payment links
          </h2>
          <p className="text-primary/60 mt-2 mb-6 text-sm leading-relaxed font-light">
            Every link created by any staff member.
          </p>
          <LinkList links={allRows} />
        </section>
      </main>
    </div>
  );
}
