import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface ExpiringMedicine {
  id: string;
  stock_qty: number;
  expiry_date: string;
  sale_price: number;
  purchase_price: number;
  medicines: {
    name: string;
    generic_name: string;
    category: string;
  };
}

interface ExpiryAlertEmailProps {
  storeName: string;
  ownerEmail: string;
  expired: ExpiringMedicine[];
  next7: ExpiringMedicine[];
  next30: ExpiringMedicine[];
}

export const ExpiryAlertEmail = ({
  storeName,
  expired,
  next7,
  next30,
}: ExpiryAlertEmailProps) => {
  const hasExpired = expired.length > 0;
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const calculateValueAtRisk = (medicines: ExpiringMedicine[]) => {
    return medicines.reduce((acc, m) => acc + (m.stock_qty * (m.purchase_price || 0)), 0);
  };

  const formatPKR = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  return (
    <Html>
      <Head />
      <Preview>Expiry Alert for {storeName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={hasExpired ? headerDanger : headerWarning}>
            <Text style={headerText}>Expiry Alert — {storeName}</Text>
            <Text style={headerSubtext}>{today}</Text>
          </Section>

          <Section style={content}>
            {expired.length > 0 && (
              <>
                <Heading style={sectionTitleDanger}>🚨 Already Expired — Remove Immediately</Heading>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Medicine</th>
                      <th style={th}>Qty</th>
                      <th style={th}>Expiry</th>
                      <th style={th}>Value at Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expired.map((m) => (
                      <tr key={m.id}>
                        <td style={td}>{m.medicines.name}</td>
                        <td style={td}>{m.stock_qty}</td>
                        <td style={td}>{m.expiry_date}</td>
                        <td style={td}>{formatPKR(m.stock_qty * (m.purchase_price || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Text style={totalValue}>Total value at risk: {formatPKR(calculateValueAtRisk(expired))}</Text>
                <Section style={actionBoxDanger}>
                  <Text style={actionText}>These medicines must be removed from your inventory immediately. Do not sell expired medicines.</Text>
                  <Button style={buttonDanger} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inventory?status=expiring`}>
                    Mark as Disposed →
                  </Button>
                </Section>
                <Hr style={hr} />
              </>
            )}

            {next7.length > 0 && (
              <>
                <Heading style={sectionTitleWarning}>⚠️ Expiring This Week</Heading>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Medicine</th>
                      <th style={th}>Qty</th>
                      <th style={th}>Expiry</th>
                      <th style={th}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {next7.map((m) => (
                      <tr key={m.id}>
                        <td style={td}>{m.medicines.name}</td>
                        <td style={td}>{m.stock_qty}</td>
                        <td style={td}>{m.expiry_date}</td>
                        <td style={td}>{formatPKR(m.stock_qty * (m.purchase_price || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Text style={actionText}>Consider selling or returning to supplier before expiry.</Text>
                <Hr style={hr} />
              </>
            )}

            {next30.length > 0 && (
              <>
                <Heading style={sectionTitleInfo}>📅 Expiring This Month</Heading>
                <ul style={list}>
                  {next30.map((m) => (
                    <li key={m.id} style={listItem}>
                      <Text style={listItemText}>{m.medicines.name} — {m.expiry_date}</Text>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <Section style={footerCta}>
              <Text style={footerText}>Log in to manage your expiring medicines</Text>
              <Button style={buttonPrimary} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inventory?status=expiring`}>
                Open Inventory →
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerSubtext}>
              You receive these alerts daily. Manage preferences in Settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ExpiryAlertEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const headerDanger = {
  backgroundColor: '#DC2626',
  padding: '32px',
  textAlign: 'center' as const,
};

const headerWarning = {
  backgroundColor: '#D97706',
  padding: '32px',
  textAlign: 'center' as const,
};

const headerText = {
  color: '#fff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const headerSubtext = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  margin: '8px 0 0',
};

const content = {
  backgroundColor: '#fff',
  padding: '32px',
};

const sectionTitleDanger = {
  color: '#DC2626',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const sectionTitleWarning = {
  color: '#D97706',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const sectionTitleInfo = {
  color: '#1E3A5F',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginBottom: '16px',
};

const th = {
  textAlign: 'left' as const,
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  paddingBottom: '8px',
  borderBottom: '1px solid #e2e8f0',
};

const td = {
  padding: '12px 0',
  fontSize: '14px',
  color: '#1e293b',
  borderBottom: '1px solid #f1f5f9',
};

const totalValue = {
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  color: '#1e293b',
};

const actionBoxDanger = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fee2e2',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
};

const actionText = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 16px',
};

const buttonDanger = {
  backgroundColor: '#DC2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const buttonPrimary = {
  backgroundColor: '#1E3A5F',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const list = {
  margin: '0',
  padding: '0',
  listStyleType: 'none',
};

const listItem = {
  marginBottom: '8px',
};

const listItemText = {
  fontSize: '14px',
  color: '#475569',
};

const footerCta = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  fontSize: '14px',
  color: '#475569',
  marginBottom: '16px',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};
