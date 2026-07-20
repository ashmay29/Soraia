import StaffHeader from "@/components/staff/StaffHeader";
import CreateLinkForm from "@/components/staff/CreateLinkForm";
import LinkList, { type LinkRow } from "@/components/staff/LinkList";
import { approvalThresholdPaise, formatInr, payUrl } from "@/lib/config";
import { listLinks, listPendingApproval } from "@/lib/links";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Payment Links · Soraia" };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function StaffHomePage() {
  const user = await requireUser();
  const links = await listLinks(user);
  // Admins see the pending count here too, so they notice without opening the dashboard.
  const pendingCount = user.role === "admin" ? (await listPendingApproval()).length : 0;
  const now = new Date();

  const rows: LinkRow[] = links.map((link) => ({
    id: link._id!.toString(),
    url: payUrl(link.token),
    amount: formatInr(link.amountPaise),
    description: link.description,
    customerName: link.customer?.name,
    status: link.status,
    createdAt: dateFmt.format(link.createdAt),
    expiresAt: link.expiresAt ? dateFmt.format(link.expiresAt) : undefined,
    isExpired: !!link.expiresAt && link.expiresAt.getTime() <= now.getTime(),
    rejectedReason: link.rejectedReason,
  }));

  const thresholdRupees = String(approvalThresholdPaise() / 100);

  return (
    <div className="bg-background min-h-screen">
      <StaffHeader user={user} pendingCount={pendingCount} />

      <main className="mx-auto grid max-w-5xl gap-12 px-6 py-12 lg:grid-cols-[380px_1fr]">
        <section>
          <h1 className="font-display text-primary text-2xl tracking-tight italic">
            New payment link
          </h1>
          <p className="text-primary/60 mt-2 mb-8 text-sm leading-relaxed font-light">
            Create a link, then send it to the customer on WhatsApp.
          </p>
          <CreateLinkForm thresholdRupees={thresholdRupees} isAdmin={user.role === "admin"} />
        </section>

        <section>
          <h2 className="font-display text-primary text-2xl tracking-tight italic">
            {user.role === "admin" ? "All payment links" : "Your payment links"}
          </h2>
          <p className="text-primary/60 mt-2 mb-8 text-sm leading-relaxed font-light">
            {rows.length > 0 ? `Showing the ${rows.length} most recent.` : "Nothing here yet."}
          </p>
          <LinkList links={rows} />
        </section>
      </main>
    </div>
  );
}
