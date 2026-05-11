import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface SubscriptionExpiringEmailProps {
  storeName: string;
  ownerName: string;
  email: string;
  planName: string;
  expiryDate: string;
  renewUrl: string;
  daysLeft: number;
}

export const SubscriptionExpiringEmail = ({
  storeName,
  ownerName,
  email,
  planName,
  expiryDate,
  renewUrl,
  daysLeft,
}: SubscriptionExpiringEmailProps) => (
  <Html>
    <Head />
    <Preview>Your MedPOS subscription expires in {daysLeft} days</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={daysLeft === 1 ? headerUrgent : header}>
          <Heading style={headerText}>Subscription Expiring</Heading>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>Assalam-o-Alaikum {ownerName},</Text>
          <Text style={paragraph}>
            Your <strong>{planName}</strong> plan for <strong>{storeName}</strong> expires on <strong>{expiryDate}</strong>.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={renewUrl}>
              Renew Now →
            </Button>
          </Section>
          <Text style={details}>
            What happens if not renewed:
            <ul>
              <li>Access suspended after expiry</li>
              <li>Data preserved for 90 days</li>
              <li>Can reactivate anytime</li>
            </ul>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = { backgroundColor: '#f6f9fc' };
const container = { backgroundColor: '#ffffff', margin: '0 auto' };
const header = { backgroundColor: '#1E3A5F', padding: '32px', textAlign: 'center' as const };
const headerUrgent = { backgroundColor: '#DC2626', padding: '32px', textAlign: 'center' as const };
const headerText = { color: '#ffffff', margin: 0 };
const content = { padding: '40px' };
const paragraph = { fontSize: '16px', lineHeight: '26px' };
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = { backgroundColor: '#1E3A5F', color: '#fff', padding: '12px 24px', borderRadius: '5px', fontWeight: 'bold' };
const details = { fontSize: '14px', color: '#64748b' };

export default SubscriptionExpiringEmail;
