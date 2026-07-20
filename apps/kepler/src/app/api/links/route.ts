import { NextResponse } from "next/server";
import { payUrl } from "@/lib/config";
import { adminAlertAddress, sendEmail } from "@/lib/email";
import { approvalAlertEmail } from "@/lib/emails/approval-alert";
import { createLink } from "@/lib/links";
import { getApiUser } from "@/lib/session";
import { createLinkSchema } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // The client sends amountPaise, but it is re-validated here — never trust the
  // browser's arithmetic on money.
  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const link = await createLink(user, parsed.data);

  // Alert the admin, but never let a mail failure lose the link. sendEmail swallows
  // its own errors; awaiting it only so serverless does not kill the request first.
  if (link.status === "pending_approval") {
    const to = adminAlertAddress();
    if (to) {
      const mail = approvalAlertEmail({
        amountPaise: link.amountPaise,
        description: link.description,
        createdByName: user.name,
        createdByEmail: user.email,
        customerName: link.customer?.name,
      });
      await sendEmail({ to, ...mail });
    } else {
      console.warn("[links] ADMIN_ALERT_EMAIL not set; no approval alert sent");
    }
  }

  return NextResponse.json(
    {
      id: link._id!.toString(),
      status: link.status,
      url: payUrl(link.token),
      needsApproval: link.status === "pending_approval",
    },
    { status: 201 }
  );
}
