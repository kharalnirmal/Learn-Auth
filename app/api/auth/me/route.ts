// app/api/auth/me/route.ts
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");

    const accessToken = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("access_token="))
      ?.trim()
      .split("=")[1];

    if (!accessToken) {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);

    return Response.json({
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}
