import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface AlertEmailProps {
  type: 'expiry' | 'low_stock' | 'drap_update';
  storeName: string;
  items: any[];
}

export const AlertEmail = ({
  type,
  storeName,
  items,
}: AlertEmailProps) => {
  const titles = {
    expiry: 'Expiry Alert',
    low_stock: 'Low Stock Alert',
    drap_update: 'DRAP Medicine Update',
  };

  return (
    <Html>
      <Head />
      <Preview>{titles[type]} - MedPOS</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>MedPOS</Heading>
          <Heading style={subheading}>{titles[type]}</Heading>
          <Text style={paragraph}>
            Store: <strong>{storeName}</strong>
          </Text>
          <Text style={paragraph}>
            The following items need your attention:
          </Text>
          {/* TODO: Step 13/14 — Render item list */}
          <Text style={footer}>
            MedPOS — Medical Store Management System
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AlertEmail;

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

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
};
