import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

void React;

export type VerificationEmailProps = {
  name: string;
  verificationLink: string;
};

const VerificationEmail = ({
  name,
  verificationLink,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Huddle email verification</Preview>
      <Container style={container}>
        <Heading style={heading}>Verify Your Email</Heading>
        <Section style={body}>
          <Text style={paragraph}>Hello <b>{name}</b>,</Text>
          <Text style={paragraph}>
            Thank you for signing up! Please verify your email address by
            clicking the button below:
          </Text>
          <Button style={button} href={verificationLink}>
            👉 Click here to verify your email 👈
          </Button>
          <Text style={paragraph}>
            If you didn't create an account, please ignore this email.
          </Text>
          <Text style={paragraph}>This link will expire in 1 hour.</Text>
          <Hr />
          <Text style={footerParagraph}>Best regards, Huddle Team</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

VerificationEmail.PreviewProps = {
  name: "John Doe",
  verificationLink: "https://example.com/verify?token=abc123",
} as VerificationEmailProps;

export default VerificationEmail;

const main = {
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 25px 0px",
};

const button = {
  backgroundColor: "oklch(70.4% 0.14 182.503)",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
};

const body = {
  margin: "24px 0",
  border: "2px solid #eaeaea",
  borderRadius: "8px",
  padding: "20px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const footerParagraph = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#6B7280",
};
