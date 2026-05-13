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

interface SubscriptionExpiringEmailProps {
  storeName: string;
  ownerEmail: string;
  planName: string;
  expiryDate: string;
  daysLeft: number;
  renewUrl: string;
}

export const SubscriptionExpiringEmail = ({
  storeName,
  planName,
  expiryDate,
  daysLeft,
  renewUrl,
}: SubscriptionExpiringEmailProps) => {
  const isUrgent = daysLeft === 1;

  return (
    <Html>
      <Head />
      <Preview>MedPOS Subscription Expiring — {storeName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={isUrgent ? headerUrgent : headerNormal}>
            <Heading style={headerTitle}>
              {isUrgent ? '⚠️ Subscription Expires TOMORROW' : '🔔 Subscription Expiring Soon'}
            </Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hello {storeName},</Text>
            <Text style={paragraph}>
              This is a friendly reminder that your <strong>{planName}</strong> plan subscription for {storeName} will expire on <strong>{expiryDate}</strong>.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Expiry Date</Text>
              <Text style={isUrgent ? detailsValueUrgent : detailsValue}>{expiryDate}</Text>
              <Text style={detailsSubtext}>{daysLeft} day(s) remaining</Text>
            </Section>

            <Heading style={subHeading}>What happens if not renewed?</Heading>
            <ul style={list}>
              <li style={listItem}>✗ Dashboard access will be suspended</li>
              <li style={listItem}>✗ POS billing will be unavailable</li>
              <li style={listItem}>✓ Your data will be safely preserved for 90 days</li>
              <li style={listItem}>✓ You can reactivate anytime by renewing</li>
            </ul>

            <Section style={ctaSection}>
              <Button style={isUrgent ? buttonUrgent : buttonPrimary} href={renewUrl}>
                Renew Subscription Now →
              </Button>
            </Section>

            <Hr style={hr} />
            <Text style={paragraph}>
              If you have already renewed or have any questions, please ignore this email or contact our support team.
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

export default SubscriptionExpiringEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const headerNormal = {
  backgroundColor: '#1E3A5F',
  padding: '32px',
  textAlign: 'center' as const,
};

const headerUrgent = {
  backgroundColor: '#DC2626',
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

const detailsBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const detailsTitle = {
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const detailsValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const detailsValueUrgent = {
  ...detailsValue,
  color: '#DC2626',
};

const detailsSubtext = {
  fontSize: '14px',
  color: '#94a3b8',
  margin: '4px 0 0',
};

const subHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  marginTop: '32px',
};

const list = {
  padding: '0',
  listStyleType: 'none',
};

const listItem = {
  fontSize: '14px',
  color: '#475569',
  marginBottom: '8px',
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

const buttonUrgent = {
  ...buttonPrimary,
  backgroundColor: '#DC2626',
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
