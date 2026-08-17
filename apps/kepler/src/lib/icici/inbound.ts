/**
 * Parses an inbound ICICI callback body.
 *
 * Advice is form-urlencoded by default, or JSON if opted for during onboarding — we
 * requested JSON but must keep working either way, including if they switch it back.
 */
export async function parseCallbackBody(req: Request): Promise<{
  params: Record<string, unknown>;
  raw: string;
}> {
  const raw = await req.text();
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { params: parsed as Record<string, unknown>, raw };
      }
    } catch {
      // Fall through — mislabelled content types are not worth failing over.
    }
  }

  return { params: Object.fromEntries(new URLSearchParams(raw)), raw };
}

/**
 * The hash may arrive in the body (V1, used by the payment response and advice) or in
 * a lowercase `securehash` header (V2, used for some JSON APIs). Merge the header in
 * so verification finds it either way.
 */
export function withHeaderHash(
  params: Record<string, unknown>,
  req: Request
): Record<string, unknown> {
  if (params.secureHash ?? params.securehash) return params;
  const header = req.headers.get("securehash");
  return header ? { ...params, secureHash: header } : params;
}
