import nodemailer from "nodemailer";

const isSmtpConfigured = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
};

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration is incomplete");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendOtpEmail = async (email: string, name: string, code: string) => {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[dev] Verification code for ${email} (${name}): ${code} (expires in 15 minutes)`
      );
      return;
    }

    throw new Error("SMTP configuration is incomplete");
  }

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your FMCG verification code",
    text: `Hello ${name}, your verification code is ${code}. It expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 8px;">Verify your FMCG account</h2>
        <p>Hello ${name},</p>
        <p>Use the code below to complete your registration. It expires in <strong>15 minutes</strong>.</p>
        <div style="font-size: 28px; letter-spacing: 8px; font-weight: 700; margin: 24px 0; color: #2563eb;">
          ${code}
        </div>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};
