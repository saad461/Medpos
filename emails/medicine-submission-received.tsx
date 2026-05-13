import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface MedicineSubmissionReceivedEmailProps {
  adminEmail: string;
  storeName: string;
  storeCity?: string;
  medicineName: string;
  genericName?: string;
  category?: string;
  company?: string;
  submitterNotes?: string;
  reviewUrl: string;
}

export const MedicineSubmissionReceivedEmail = ({
  storeName,
  storeCity,
  medicineName,
  genericName,
  category,
  company,
  submitterNotes,
  reviewUrl,
}: MedicineSubmissionReceivedEmailProps) => (
  <Html>
    <Head />
    <Preview>New Medicine Submission — {medicineName} from {storeName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Medicine Submission</Heading>
        <Section style={section}>
          <Text style={text}>
            <strong>Store:</strong> {storeName} {storeCity ? `(${storeCity})` : ''}
          </Text>
          <Text style={text}>
            <strong>Medicine:</strong> {medicineName}
          </Text>
          <Text style={text}>
            <strong>Generic:</strong> {genericName || 'N/A'}
          </Text>
          <Text style={text}>
            <strong>Category:</strong> {category || 'N/A'}
          </Text>
          <Text style={text}>
            <strong>Company:</strong> {company || 'N/A'}
          </Text>
          {submitterNotes && (
            <Text style={text}>
              <strong>Notes:</strong> {submitterNotes}
            </Text>
          )}
        </Section>
        <Section style={btnContainer}>
          <Button style={button} href={reviewUrl}>
            Review Submission →
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          MedPOS Admin Notification
        </Text>
      </Container>
    </Body>
  </Html>
);

export default MedicineSubmissionReceivedEmail;

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

const section = {
  padding: '0 48px',
};

const h1 = {
  color: '#1e3a5f',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

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
