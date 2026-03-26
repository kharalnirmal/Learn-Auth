import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

//our jwt helpers from lib/jwt.ts
//signAccessToken -> create 15 min token
// signRefreshToken -> create 7 day token

export async function POST(request: Request) {
  try {
    //--------------------Step-1 : Read Body -------------
    const body = await request.json();
    const { email, password } = body;

    // ----------- Step-2 validate data ----------

    if (!email || !password) {
      return Response.json(
        { error: " Email and Password are required" },
        {
          status: 400,
        },
      );
    }
    //----------- Step-3 FInd User -------
    const user = await prisma.user.findUnique({
      where: { email },
    });

    //Important : we say "invalid credentials" not "Email not found"
    //why ? if we say "email not found ", attacker can discover
    //Which email are registered in your system
    //vague error message =  more secure

    if (!user) {
      return Response.json({ error: "invalid credentials" }, { status: 401 });
    }
    // ── STEP 4: CHECK EMAIL IS VERIFIED ────────────────────
    if (!user.isVerified) {
      return Response.json(
        { error: "Please verify your email before logging in" },
        { status: 403 },
        // 403 = Forbidden
        // we KNOW who they are, but they're not allowed yet
      );
    }

    // Step-5 : check Password---------------
    const passwordMatch = await bcrypt.compare(password, user.password);
    // bcrypt.compare(plainText, hash)
    // password      = what the user just typed e.g. "hello123"
    // user.password = the hash stored in DB e.g. "$2b$12$eW8R..."
    // bcrypt hashes the plain text the same way and compares
    // returns true if they match, false if not
    // await because this is computationally intensive

    if (!passwordMatch) {
      return Response.json(
        { error: "invalid credentials" },
        // same vague message as "user not found"
        // attacker can't tell if email was wrong or password was wrong
        { status: 401 },
      );
    }

    // ── STEP 6: CREATE TOKENS ──────────────────────────────
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
      // this number must match DB — used for "logout all devices"
    };

    const accessToken = signAccessToken(tokenPayload);
    // creates a JWT string that expires in 15 minutes
    // e.g., "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQi..."

    const refreshToken = signRefreshToken(tokenPayload);
    // creates a JWT string that expires in 7 days

    //------------- Step-7 : save RefreshToken to DB
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // 7 days in milliseconds:
    // 7 days × 24 hours × 60 minutes × 60 seconds × 1000ms

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshExpiry,
      },
    });

    const deviceInfo = request.headers.get("user-agent") || "unknown device";
    // user-agent header = browser and OS info
    // e.g., "Mozilla/5.0 (Windows NT 10.0) Chrome/120..."
    // || 'Unknown device' = fallback if header is missing

    await prisma.session.create({
      data: {
        userId: user.id,
        deviceInfo,
      },
    });

    // ── STEP 9: SET COOKIES ────────────────────────────────
    // We don't return tokens in the response BODY
    // Instead we set them as httpOnly cookies
    // httpOnly = JavaScript in the browser CANNOT read them
    // They're sent automatically with every request
    // This protects against XSS attacks

    const response = Response.json(
      {
        message: "Logged in Successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        // never return password or tokens in the body
      },
      { status: 200 },
    );

    //Set access token cookies

    response.headers.append(
      "Set-Cookie",
      `access_token=${accessToken}; HttpOnly; Path=/;  Max-Age=900; SameStrict=Strict`,

      // access_token=...  the cookie name and value
      // HttpOnly          JS cannot read this — only browser sends it
      // Path=/            send with ALL requests to this domain
      // Max-Age=900       expires after 900 seconds = 15 minutes
      // SameSite=Strict   only sent to our own domain
    );

    // Set refresh token cookie
    response.headers.append(
      "Set-Cookie",
      `refresh_token=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`,
      // Max-Age=604800    expires after 604800 seconds = 7 days
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
