import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    console.log("Cookie header:", request.headers.get("cookie"));
    // ── STEP 1: READ ACCESS TOKEN FROM COOKIE ──────────────
    const cookieHeader = request.headers.get("cookie");
    const accessToken = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("access_token="))
      ?.trim()
      .split("=")[1];

    if (!accessToken) {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    // ── STEP 2: VERIFY TOKEN ────────────────────────────────

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (error) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    // ── STEP 3: RETURN USER INFO ───────────────────────────
    const sessions = await prisma.session.findMany({
      where: { userId: payload.userId },
      select: {
        id: true,
        deviceInfo: true,
        lastSeen: true,
        createdAt: true,
      },
      orderBy: { lastSeen: "desc" },
      // most recently active session first
    });
    // ── STEP 4: RETURN SESSIONS ────────────────────────────
    return Response.json(
      {
        sessions,
        count: sessions.length,
        // how many active sessions total
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Sessions error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
