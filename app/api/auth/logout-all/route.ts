import { verifyRefreshToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    console.log("Cookie header:", request.headers.get("cookie"));
    // Step-1 : Read And Verify Refresh Token
    const cookieHeader = request.headers.get("cookie");

    const refreshToken = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("refresh_token="))
      ?.trim()
      .split("=")[1];

    if (!refreshToken) {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    // verify to get userId from the token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    // ── STEP 2: INCREMENT TOKEN VERSION ────────────────────
    await prisma.user.update({
      where: { id: payload.userId },
      data: { tokenVersion: { increment: 1 } },
      // this single increment invalidates EVERY
      // existing token for this user instantly
      // any token with old version = rejected by proxy
    });

    // ── STEP 3: DELETE ALL REFRESH TOKENS ──────────────────
    await prisma.refreshToken.deleteMany({
      where: { userId: payload.userId },
      // removes ALL devices' refresh tokens
    });

    // ── STEP 4: DELETE ALL SESSIONS ────────────────────────
    await prisma.session.deleteMany({
      where: { userId: payload.userId },
      // removes ALL devices' sessions
    });

    // ── STEP 5: CLEAR COOKIES ON THIS DEVICE ───────────────
    const response = Response.json(
      { message: "Logged out from all devices successfully" },
      { status: 200 },
    );

    response.headers.append(
      "Set-Cookie",
      `access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
    );

    response.headers.append(
      "Set-Cookie",
      `refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
    );

    return response;
  } catch (error) {
    console.error("Logout all error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
