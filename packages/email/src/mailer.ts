import nodemailer from "nodemailer";
import VerificationEmail, {
  VerificationEmailProps,
} from "./templates/verification-email";
import { render } from "@react-email/components";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
  auth: {
    type: "OAuth2",
    user: "unknowhost96@gmail.com",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken:
      "1//04fk6E9pc384zCgYIARAAGAQSNwF-L9Ir-MZFzAI4vqsFnup5-zEPw9rFl9vF55s6Phs7pq7GYdNZzINCcoWKcL1Yz4dnQ16fTfE", // process.env.GOOGLE_REFRESH_TOKEN,
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
      from: "Huddle <unknowhost96@gmail.com>",
      to,
      subject,
      html: emailTemplate,
    });
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};
