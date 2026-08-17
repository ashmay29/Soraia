import { appBaseUrl, formatInr } from "../config";

export interface ApprovalAlert {
  amountPaise: number;
  description: string;
  createdByName: string;
  createdByEmail: string;
  customerName?: string;
}

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => `&${{ "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "#39" }[c]};`
  );

/**
 * Deliberately does NOT include the payment link itself. Email is a low-trust
 * channel — anyone reading the admin's inbox would otherwise get a payable URL.
 * The admin approves from the dashboard, behind a login.
 */
export async function approvalAlertEmail(alert: ApprovalAlert) {
  const amount = formatInr(alert.amountPaise);
  const url = `${await appBaseUrl()}/staff/admin`;
  const customerLine = alert.customerName ? `Customer: ${alert.customerName}\n` : "";

  const text = [
    `A payment link of ${amount} needs your approval.`,
    ``,
    `Amount: ${amount}`,
    `For: ${alert.description}`,
    customerLine + `Created by: ${alert.createdByName} (${alert.createdByEmail})`,
    ``,
    `Approve or reject here: ${url}`,
    ``,
    `The customer cannot pay until this is approved.`,
  ].join("\n");

  const html = `
<div style="font-family:Georgia,'Times New Roman',serif;background:#f5f3e5;padding:32px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#f5f3e5;border:1px solid #c9a05c;border-radius:2px;padding:32px;">
    <p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#00382e;opacity:.5;">Soraia</p>
    <h1 style="margin:0 0 24px;font-size:24px;font-style:italic;font-weight:400;color:#00382e;">Approval needed</h1>

    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#00382e;">
      A payment link above the approval limit has been created. The customer
      <strong>cannot pay until you approve it</strong>.
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#00382e;">
      <tr><td style="padding:8px 0;opacity:.6;width:110px;">Amount</td><td style="padding:8px 0;font-size:20px;">${escape(amount)}</td></tr>
      <tr><td style="padding:8px 0;opacity:.6;">For</td><td style="padding:8px 0;">${escape(alert.description)}</td></tr>
      ${alert.customerName ? `<tr><td style="padding:8px 0;opacity:.6;">Customer</td><td style="padding:8px 0;">${escape(alert.customerName)}</td></tr>` : ""}
      <tr><td style="padding:8px 0;opacity:.6;">Created by</td><td style="padding:8px 0;">${escape(alert.createdByName)}<br><span style="opacity:.6;font-size:12px;">${escape(alert.createdByEmail)}</span></td></tr>
    </table>

    <a href="${url}" style="display:inline-block;margin-top:28px;background:#00382e;color:#f5f3e5;text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:2px;text-transform:uppercase;border-radius:2px;">
      Review in dashboard
    </a>

    <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#00382e;opacity:.5;">
      You are receiving this because you are the approver for Soraia payment links.
    </p>
  </div>
</div>`.trim();

  return {
    subject: `Approval needed — ${amount} payment link`,
    text,
    html,
  };
}
