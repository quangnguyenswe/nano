import nodemailer from "nodemailer";
import VerificationEmail, {
  VerificationEmailProps,
} from "./templates/verification-email";
import { render } from "@react-email/components";
import dotenv from "dotenv";
import "dotenv/config";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
  auth: {
    type: "OAuth2",
    user: process.env.SMTP_FROM,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

export const sendVerificationEmail = async (
  to: string,
  subject: string,
  data: VerificationEmailProps,
) => {
  const emailTemplate = await render(VerificationEmail(data));
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailTemplate,
    });
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};
