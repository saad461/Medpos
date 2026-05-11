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

interface PaymentFailedEmailProps {
  storeName: string;
  ownerName: string;
  email: string;
  planName: string;
  retryUrl: string;
}

export const PaymentFailedEmail = ({
  storeName,
  ownerName,
  email,
  planName,
  retryUrl,
}: PaymentFailedEmailProps) => (
  <Html>
    <Head />
    <Preview>Action Required — MedPOS Payment Failed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={headerText}>Payment Failed</Heading>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>Assalam-o-Alaikum {ownerName},</Text>
          <Text style={paragraph}>
            We could not process your payment for the <strong>{planName}</strong> subscription for <strong>{storeName}</strong>.
          </Text>
          <Text style={warningText}>
            Your account remains active for 7 days. After that, access will be suspended.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={retryUrl}>
              Update Payment Method →
            </Button>
          </Section>
          <Text style={footer}>
            Need help? Contact us on WhatsApp: 0300-MEDPOS
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = { backgroundColor: '#f6f9fc' };
const container = { backgroundColor: '#ffffff', margin: '0 auto' };
const header = { backgroundColor: '#D97706', padding: '32px', textAlign: 'center' as const };
const headerText = { color: '#ffffff', margin: 0 };
const content = { padding: '40px' };
const paragraph = { fontSize: '16px', lineHeight: '26px' };
const warningText = { color: '#D97706', fontWeight: 'bold' };
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = { backgroundColor: '#1E3A5F', color: '#fff', padding: '12px 24px', borderRadius: '5px', fontWeight: 'bold' };
const footer = { color: '#8898aa', fontSize: '12px', textAlign: 'center' as const };

export default PaymentFailedEmail;
