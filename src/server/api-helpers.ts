import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { BotServiceError } from "@/server/services/errors";
import type { ZodType } from "zod";

/** Maps a BotServiceError's code to an HTTP status honestly reflecting what
 * happened — never 200 for a failed bot call. */
const STATUS_BY_CODE: Record<BotServiceError["code"], number> = {
  not_configured: 409,
  not_capable: 404,
  offline: 502,
  unauthorized: 502,
  network_error: 502,
  bad_response: 502,
};

/** Every mutating/reading route wraps its bot-facing work in this so a
 * BotServiceError becomes an honest JSON error response instead of an
 * unhandled 500 or (worse) a response that looks like success. */
export async function withBotErrors<T>(
  fn: () => Promise<T>
): Promise<NextResponse<T> | NextResponse<{ error: string; code: string }>> {
  try {
    const data = await fn();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof BotServiceError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: STATUS_BY_CODE[err.code] }
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Unexpected server error", code: "unknown" },
      { status: 500 }
    );
  }
}

/** Requires a signed-in session; returns the user id or a 401 response.
 * proxy.ts already blocks unauthenticated /api/* requests, but routes check
 * again so they're safe even if ever called from a context proxy.ts
 * doesn't cover. */
export async function requireUserId(): Promise<
  { userId: string } | { error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId: session.user.id };
}

/** Parses and validates a request body against a Zod schema, returning a 400
 * response on failure instead of letting a malformed payload reach the bot
 * or the database. */
export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>
): Promise<{ data: T } | { error: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: "Invalid request body", issues: result.error.issues },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}
