import nodemailer from "nodemailer";
//nodemailer is the package that handles email sending
//it connects to GMAIL'S SMTP server on your behalf

//--- CREATE A TRANSPORTER -------------
// a transporter is an object that knows how to send mail
//Think of it like setting up your mail carrier
// we create a transporter using the createTransport method of nodemailer
// we pass in an object with the configuration for our email service
// in this case, we are using Gmail's SMTP server
// we also need to provide our email and password for authentication

const transporter = nodemailer.createTransport({
  service: "gmail",
  // 'gmail' = use Gmail's SMTP settings automatically
  // nodemailer knows Gmail's server address and port
  // so we don't have to configure them manually
  auth: {
    user: process.env.EMAIL_USER!,
    // your Gmail address
    // e.g., "yourname@gmail.com"

    pass: process.env.EMAIL_PASS!,
    // your App Password (NOT your real Gmail password)
    // e.g., "xxxxxxxxxxxxxxxx"
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  // async because sending email takes time
  // it's a network request to Gmail's servers
  //--- DEFINE THE EMAIL CONTENT -------------
  // we create an email object that defines the content of the email we want to send
  // this includes the sender, recipient, subject, and body of the email

  const mailOptions = {
    from: `"Auth Master"<${process.env.EMAIL_USER}>`,
    // from = who the email appears to be from
    // "Auth Master" = the display name
    // <email> = the actual email address
    // e.g., "Auth Master <yourname@gmail.com>"

    to: email,
    // to = who we're sending to
    // this is the user's email address

    subject: "Your verification code",
    // subject = the email subject line
    // what the user sees in their inbox

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Verify your email</h2>
        <p>Your verification code is:</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #6366f1;
          padding: 20px;
          background: #f3f4f6;
          text-align: center;
          border-radius: 8px;
          margin: 20px 0;
        ">
          ${otp}
        </div>
        <p style="color: #6b7280;">This code expires in 10 minutes.</p>
        <p style="color: #6b7280;">If you didn't request this, ignore this email.</p>
      </div>
    `,
    // html = the email body as HTML
    // we style it to look clean and professional
    // ${otp} = inserts the actual 6-digit code
  };
  await transporter.sendMail(mailOptions);
  // sendMail = actually sends the email
  // await = wait for Gmail to confirm it was sent
  // throws an error if sending fails
}
