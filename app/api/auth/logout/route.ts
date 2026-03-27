import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    console.log("Cookie header:", request.headers.get("cookie"));
    // ── STEP 1: READ REFRESH TOKEN FROM COOKIE ─────────────
    const cookieHeader = request.headers.get("cookie");

    if (!cookieHeader) {
      return Response.json({ message: "No cookies found" }, { status: 400 });
    }

    const refreshToken = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("refresh_token="))
      ?.trim()
      .split("=")[1];

    // ── STEP 2: DELETE REFRESH TOKEN FROM DB ───────────────

    if (refreshToken) {
      // find the token record to get userId
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
        //deleteMany instead of delete because
        // delete throws an error if record not found
        // deleteMany just does nothing if not found
        // safer - no crash if token already deleted
      });

      // ── STEP 3: DELETE SESSION FROM DB ───────────────────
      // then delete the matching session
      if (tokenRecord) {
        await prisma.session.deleteMany({
          where: { userId: tokenRecord.userId },
        });
      }
    }
    // ── STEP 4: CLEAR BOTH COOKIES ─────────────────────────
    const response = Response.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );
    // Clear access token cookie
    response.headers.append(
      "Set-Cookie",
      `access_token= ; HttpOnly ; Path=/ ; Max-Age=0; SameSite=Strict`,
    );
    // Max-Age=0 = expire this cookie immediately
    // browser deletes it right away

    // Clear access token cookie

    response.headers.append(
      "Set-Cookie",
      `refresh_token=; HttpOnly ; Path=/ ; Max-Age=0 ;  SameSite= Strict`,
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
