import * as React from 'react';
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

interface MedicineRejectedEmailProps {
  ownerName: string;
  storeName: string;
  ownerEmail: string;
  medicineName: string;
  rejectionReason: string;
  resubmitUrl: string;
}

export const MedicineRejectedEmail = ({
  ownerName,
  storeName,
  medicineName,
  rejectionReason,
  resubmitUrl,
}: MedicineRejectedEmailProps) => (
  <Html>
    <Head />
    <Preview>Medicine Submission Update — {medicineName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
            <Heading style={h1}>Submission Update</Heading>
        </Section>
        <Section style={section}>
          <Text style={text}>Hello {ownerName},</Text>
          <Text style={text}>
            Your submission for <strong>{medicineName}</strong> from <strong>{storeName}</strong> could not be approved at this time.
          </Text>

          <Section style={reasonCard}>
            <Text style={reasonLabel}>Reviewer's note:</Text>
            <Text style={reasonText}>{rejectionReason}</Text>
          </Section>

          <Text style={text}>
            <strong>What you can do:</strong>
          </Text>
          <ul style={list}>
            <li>Fix the issues mentioned above</li>
            <li>Resubmit from your inventory dashboard</li>
            <li>Keep the medicine as private in your store</li>
            <li>Contact support if you have questions</li>
          </ul>
        </Section>

        <Section style={btnContainer}>
          <Button style={button} href={resubmitUrl}>
            View & Resubmit →
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Your medicine is still available privately in your store.
        </Text>
        <Text style={footer}>
          MedPOS — Cloud-based Pharmacy Management
        </Text>
      </Container>
    </Body>
  </Html>
);

export default MedicineRejectedEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 0 48px',
  marginBottom: '64px',
};

const header = {
    backgroundColor: '#71717a',
    padding: '30px 48px',
    textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const section = {
  padding: '24px 48px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const list = {
    color: '#525f7f',
    fontSize: '15px',
    lineHeight: '24px',
}

const reasonCard = {
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
}

const reasonLabel = {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 4px',
}

const reasonText = {
    color: '#b45309',
    fontSize: '14px',
    margin: '0',
}

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#0ea5e9',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px',
  margin: '0 auto',
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
};
