import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface SubscriptionExpiredEmailProps {
  storeName: string;
  ownerEmail: string;
  planName: string;
  renewUrl: string;
}

export const SubscriptionExpiredEmail = ({
  storeName,
  planName,
  renewUrl,
}: SubscriptionExpiredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>MedPOS Subscription Ended — {storeName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Your Subscription has Ended</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hello {storeName},</Text>
            <Text style={paragraph}>
              Your <strong>{planName}</strong> plan subscription for {storeName} has expired and your dashboard access has been suspended.
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                Don't worry! Your data is safe. We will preserve all your records for the next <strong>90 days</strong>. You can reactivate your account anytime by renewing your subscription.
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Button style={buttonPrimary} href={renewUrl}>
                Reactivate Subscription Now →
              </Button>
            </Section>

            <Hr style={hr} />
            <Text style={paragraph}>
              If you have any questions or need assistance, please reply to this email or contact our support team.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>MedPOS — The Complete Pharmacy Management Solution</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionExpiredEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const header = {
  backgroundColor: '#1e293b',
  padding: '32px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#fff',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  backgroundColor: '#fff',
  padding: '32px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
};

const infoBox = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const infoText = {
  fontSize: '14px',
  color: '#475569',
  lineHeight: '24px',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const buttonPrimary = {
  backgroundColor: '#1E3A5F',
  borderRadius: '6px',
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

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  fontSize: '12px',
  color: '#94a3b8',
};
