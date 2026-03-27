import { signAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Step-1 : Read the Refresh token from cookies
    const cookieHeader = request.headers.get("cookie");
    //gets the raw cookie string form the request

    if (!cookieHeader) {
      return Response.json({ message: "No cookies found" }, { status: 400 });
    }

    // Parse  the refresh token  out if cookie string

    const refreshToken = cookieHeader
      .split(";")
      // split by semicolon → ["access_token=eyJ...", " refresh_token=eyJ..."]
      .find((c) => c.trim().startsWith("refresh_token="))
      // find the one that starts with "refresh_token="
      ?.trim()
      // remove whitespace from both ends
      .split("=")[1];
    // split by = → ["refresh_token", "eyJ..."]
    // take index [1] → just the token value

    if (!refreshToken) {
      return Response.json(
        { error: "Refresh token not found" },
        { status: 401 },
      );
    }

    // ── STEP 2: VERIFY JWT SIGNATURE ───────────────────────
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
      // verifyRefreshToken THROWS if:
      // - token was tampered with
      // - token is expired (past 7 days)
    } catch {
      return Response.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // ── STEP 3: CHECK TOKEN EXISTS IN DATABASE ─────────────
    const tokenInDb = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenInDb) {
      return Response.json(
        { error: "Refresh token not found" },
        { status: 401 },
        // token was deleted (user logged out)
        // even if JWT is valid, we reject it
        // this is why we store refresh tokens in DB
      );
    }

    // ── STEP 4: CHECK TOKEN NOT EXPIRED IN DB ──────────────
    if (tokenInDb.expiresAt < new Date()) {
      return Response.json({ error: "Refresh token expired" }, { status: 401 });
    }

    // ── STEP 5: GET USER + CHECK TOKEN VERSION ─────────────
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      // tokenVersion in JWT doesn't match DB
      // means "logout all devices" was called
      // this token is no longer valid
      return Response.json({ error: "Session invalidated" }, { status: 401 });
    }

    // ── STEP 6: ISSUE NEW ACCESS TOKEN ─────────────────────
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // ── STEP 7: SET NEW ACCESS TOKEN AS COOKIE ─────────────
    const response = Response.json(
      { message: "Token refreshed successfully" },
      { status: 200 },
    );
    response.headers.set(
      "Set-Cookie",
      `access_token=${newAccessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Strict`,
    );

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
