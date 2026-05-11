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
  ownerName: string;
  email: string;
  plan: string;
  trialEndsAt: string;
  loginUrl: string;
  whatsappNumber: string;
}

export const WelcomeEmail = ({
  storeName,
  ownerName,
  email,
  plan,
  trialEndsAt,
  loginUrl,
  whatsappNumber,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MedPOS! Your pharmacy dashboard is ready.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={headerText}>MedPOS</Heading>
          <Text style={headerSub}>Welcome to MedPOS!</Text>
        </Section>
        <Container style={content}>
          <Text style={paragraph}>Assalam-o-Alaikum {ownerName},</Text>
          <Text style={paragraph}>
            Your MedPOS account for <strong>{storeName}</strong> has been created successfully.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsText}>📧 <strong>Email:</strong> {email}</Text>
            <Text style={detailsText}>📦 <strong>Plan:</strong> {plan} — 14-day free trial</Text>
            <Text style={detailsText}>📅 <strong>Trial ends:</strong> {trialEndsAt}</Text>
            <Text style={detailsText}>🔗 <strong>Dashboard:</strong> app.medpos.pk</Text>
          </Section>

          <Heading style={subheading}>What to do next:</Heading>
          <Text style={paragraph}>
            1. Check your email for account approval (usually 2 hours)<br />
            2. Once approved, log in at app.medpos.pk<br />
            3. Follow the guided tour to add your medicines<br />
            4. Make your first sale in under 5 minutes
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Open Your Dashboard →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={paragraph}>Need help? We are here for you:</Text>
          <Text style={supportItem}>📱 <strong>WhatsApp:</strong> {whatsappNumber}</Text>
          <Text style={supportItem}>📧 <strong>Email:</strong> support@medpos.pk</Text>

          <Text style={footer}>
            If you did not create this account, please contact us immediately at support@medpos.pk
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            © 2026 MedPOS — Medical Store Management System<br />
            Built for Pakistani Pharmacies
          </Text>
        </Container>
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
  marginBottom: '64px',
};

const header = {
  backgroundColor: '#1E3A5F',
  padding: '32px',
  textAlign: 'center' as const,
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const headerSub = {
  color: '#ffffff',
  opacity: '0.8',
  fontSize: '16px',
  margin: '8px 0 0',
};

const content = {
  padding: '40px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
};

const detailsBox = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const detailsText = {
  fontSize: '14px',
  margin: '8px 0',
  color: '#1e293b',
};

const subheading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1E3A5F',
  marginTop: '32px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#1E3A5F',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const supportItem = {
  fontSize: '14px',
  margin: '4px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};
