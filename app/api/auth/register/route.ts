import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  //async because we  await database queries and bcrypt

  try {
    //------- Step 1: Read The Request Body ---------------
    const body = await request.json();
    //request.json() reads the raw request body and parse it as json
    // await because reading the body is asynchronous
    //body is now a plain javaScript object
    //eg. { email,"john@example.com", password:"hello123"}

    const { email, password } = body;

    // ---------- Step-2  : Validate Input -----
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are Required" },
        { status: 400 },

        // 400 = Bad Request
        //the user made a mistake - they forget to send Something
      );
    }

    // Extra Validation - is the mail formate Valid ?
    //.include("@") is simply check - a real email must have  @

    if (!email.includes("@")) {
      return Response.json(
        { error: "Invalid email formate " },
        { status: 400 },
      );
    }

    // Password Length Check
    if (password.length < 6) {
      return Response.json(
        { error: "password must be at least 6 character" },
        { status: 400 },
      );
    }
    // ── STEP 3: CHECK IF EMAIL ALREADY EXISTS ──────────────

    const existingUser = await prisma.user.findUnique({
      where: { email },
      // shorthand for { email: email }
      // when key and variable name are the same, you can write just { email }
    });

    if (existingUser) {
      return Response.json(
        { error: "email already registered" },
        { status: 409 },
        //409 = conflict
        //the resource (email) already exists
      );
    }

    // ── STEP 4: HASH THE PASSWORD ──────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);
    // bcrypt.hash(plaintext, saltRounds)
    // password   = the plain text password e.g. "hello123"
    // 12         = salt rounds — how many times to scramble
    //              12 is the industry standard
    //              higher = more secure but slower
    //              lower  = faster but easier to crack
    // returns    = a string like "$2b$12$eW8RqOSP1x..."
    // await      = hashing takes a moment, it's asynchronous

    // ── STEP 5: CREATE THE USER ────────────────────────────
    const user = await prisma.user.create({
      data: {
        email,
        // shorthand for email: email
        password: hashedPassword,
        // NEVER save plain text — always the hash
      },
      select: {
        id: true,
        email: true,
        role: true,
        // we select only these fields
        // password is intentionally excluded
        // never return password data, even hashed
      },
    });

    //--------- Step-6 : Generate OTP ------------------
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Math.random()        → random decimal between 0 and 1
    //                        e.g., 0.4823...
    // * 900000             → between 0 and 900000
    //                        e.g., 434070...
    // + 100000             → between 100000 and 999999
    //                        guarantees 6 digits always
    // Math.floor()         → remove the decimal
    //                        e.g., 534070
    // .toString()          → convert number to string
    //                        e.g., "534070"

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    // Date.now()           → current time in milliseconds
    //                        e.g., 1710000000000
    // 10 * 60 * 1000       → 10 minutes in milliseconds
    //                        10 minutes × 60 seconds × 1000ms = 600000ms
    // Date.now() + 600000  → current time + 10 minutes
    // new Date(...)        → convert to a Date object Prisma understands

    //-───────── STEP 7: SAVE OTP TO DATABASE ───────────────────

    await prisma.otp.create({
      data: {
        email,
        code: otpCode,
        expiresAt: otpExpiry,
        userId: user.id,
      },
    });

    // ── STEP 8: SEND OTP EMAIL ─────────────────────────────
    // We'll add real email sending in Phase 8
    // For now, log it to console so we can test
    console.log(`OTP for ${email}: ${otpCode}`);
    // In development, you'll see this in your terminal
    // e.g., "OTP for john@example.com: 482910"

    return Response.json(
      {
        message: "Registration successful. Check your email for the OTP.",
        userId: user.id,
        // sending userId so the verify page knows who to verify
      },
      { status: 201 },
      // 201 = Created
      // specifically means "a new resource was created"
      // more specific than 200 OK
    );
  } catch (error) {
    //anything that threw an  error lands here
    console.error("register Error:", error);
    // log the real error to terminal for debugging
    // never send the real error to the browser — security risk

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
