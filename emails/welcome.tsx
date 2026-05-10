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
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  storeName: string;
  email: string;
  plan: string;
  trialEndsAt: string;
  loginUrl: string;
}

export const WelcomeEmail = ({
  storeName,
  email,
  plan,
  trialEndsAt,
  loginUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MedPOS!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>MedPOS</Heading>
        <Heading style={subheading}>Welcome to MedPOS!</Heading>
        <Text style={paragraph}>
          Your store <strong>{storeName}</strong> is now active.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={loginUrl}>
            Login to your dashboard
          </Button>
        </Section>
        <Text style={paragraph}>
          <strong>Email:</strong> {email}<br />
          <strong>Plan:</strong> {plan}<br />
          <strong>Trial Ends At:</strong> {trialEndsAt}
        </Text>
        <Hr style={hr} />
        <Text style={paragraph}>
          WhatsApp support: +92 3XX XXXXXXX (placeholder)<br />
          <Link href="#">Watch Urdu tutorial video (placeholder)</Link>
        </Text>
        <Text style={footer}>
          MedPOS — Medical Store Management System
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#1E3A5F',
  padding: '17px 0 0',
  textAlign: 'center' as const,
};

const subheading = {
  fontSize: '20px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
  padding: '0 40px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '33px 0',
};

const button = {
  backgroundColor: '#0EA5E9',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
};
