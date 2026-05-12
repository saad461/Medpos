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

interface ChangedMedicine {
  name: string;
  oldMRP: number;
  newMRP: number;
}

interface DRAPUpdateEmailProps {
  storeName: string;
  ownerEmail: string;
  updatedCount: number;
  changedMedicines: ChangedMedicine[];
}

export const DRAPUpdateEmail = ({
  storeName,
  updatedCount,
  changedMedicines,
}: DRAPUpdateEmailProps) => {
  const monthYear = new Date().toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>DRAP Price Update — {updatedCount} medicines updated</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Monthly DRAP Price Update</Text>
            <Text style={headerSubtext}>{monthYear}</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hello {storeName},</Text>
            <Text style={paragraph}>
              <strong>{updatedCount}</strong> medicine prices were updated by DRAP this month.
            </Text>
            <Text style={paragraph}>
              Please note that these are <strong>reference prices only</strong>. Your own sale prices have not been automatically changed.
            </Text>

            {changedMedicines && changedMedicines.length > 0 && changedMedicines.length <= 10 ? (
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Medicine</th>
                    <th style={th}>Old MRP</th>
                    <th style={th}>New MRP</th>
                    <th style={th}>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {changedMedicines.map((m, i) => {
                    const change = ((m.newMRP - m.oldMRP) / m.oldMRP) * 100;
                    return (
                      <tr key={i}>
                        <td style={td}>{m.name}</td>
                        <td style={td}>Rs. {m.oldMRP.toFixed(2)}</td>
                        <td style={td}>Rs. {m.newMRP.toFixed(2)}</td>
                        <td style={change >= 0 ? tdSuccess : tdDanger}>
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : changedMedicines && changedMedicines.length > 10 ? (
              <Section style={infoBox}>
                <Text style={infoText}>
                  More than 10 medicines were updated. You can review the full list and adjust your prices in your dashboard.
                </Text>
              </Section>
            ) : null}

            <Section style={ctaSection}>
              <Button style={buttonPrimary} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inventory`}>
                Review Your Prices →
              </Button>
            </Section>

            <Section style={noteBox}>
              <Text style={noteText}>
                <strong>Tip:</strong> Your sale prices are not affected by DRAP updates. Review these changes to see if you want to adjust your margins.
              </Text>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>MedPOS — DRAP Sync Service</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DRAPUpdateEmail;

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
  backgroundColor: '#0EA5E9',
  padding: '32px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#fff',
  fontSize: '20px',
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

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  margin: '24px 0',
};

const th = {
  textAlign: 'left' as const,
  fontSize: '11px',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  paddingBottom: '8px',
  borderBottom: '1px solid #e2e8f0',
};

const td = {
  padding: '10px 0',
  fontSize: '13px',
  color: '#1e293b',
  borderBottom: '1px solid #f1f5f9',
};

const tdSuccess = {
  ...td,
  color: '#059669',
  fontWeight: 'bold',
};

const tdDanger = {
  ...td,
  color: '#DC2626',
  fontWeight: 'bold',
};

const infoBox = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  fontSize: '14px',
  color: '#475569',
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

const noteBox = {
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #D97706',
  padding: '16px',
  marginTop: '32px',
};

const noteText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  fontSize: '12px',
  color: '#94a3b8',
};
