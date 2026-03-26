import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // ── STEP 1: READ AND VALIDATE ───────────────────────────

    const { email, code } = body;
    if (!email || !code) {
      return Response.json(
        { error: "Email and Code is required" },
        { status: 400 },
      );
    }

    // ── STEP 2: FIND THE OTP RECORD ────────────────────────

    const otp = await prisma.otp.findFirst({
      where: { email, code },
      // we use findFirst not findUnique because
      // we're searching by email + code together
      // neither of those is @unique alone in our schema
      // findFirst finds the first record matching ALL conditions
    });

    if (!otp) {
      return Response.json({ error: "invalid otp!!!" }, { status: 400 });
    }
    // ── STEP 3: CHECK IF ALREADY USED ──────────────────────
    if (otp.used) {
      return Response.json(
        { error: "OTP is used already!!!" },
        { status: 400 },
        // someone is trying to reuse an old code
        // this prevents replay attacks
      );
    }
    // ── STEP 4: CHECK IF EXPIRED ───────────────────────────
    if (otp.expiresAt < new Date()) {
      // otp.expiresAt  = when the code expires (saved in DB)
      // new Date()     = right now
      // if expiry time is BEFORE now = expired
      return Response.json(
        { error: "Code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // ── STEP 5: MARK OTP AS USED ───────────────────────────

    await prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
      // mark as used so it can never be used again
    });
    // ── STEP 6: MARK USER AS VERIFIED ──────────────────────
    await prisma.user.update({
      where: { id: otp.userId },
      data: { isVerified: true },
      // now this user can log in
    });

    // ── STEP 7: RETURN SUCCESS ─────────────────────────────
    return Response.json(
      { message: "Email verified successfully. You can now log in." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
