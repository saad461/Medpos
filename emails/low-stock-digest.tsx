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
  Column,
  Row,
} from '@react-email/components';
import * as React from 'react';

interface LowStockMedicine {
  id: string;
  stock_qty: number;
  reorder_level: number;
  supplier_id: string;
  medicines: {
    name: string;
    generic_name: string;
    unit: string;
  };
  suppliers: {
    name: string;
    email: string;
    phone: string;
  };
}

interface LowStockDigestEmailProps {
  storeName: string;
  ownerEmail: string;
  outOfStock: LowStockMedicine[];
  lowStock: LowStockMedicine[];
}

export const LowStockDigestEmail = ({
  storeName,
  outOfStock,
  lowStock,
}: LowStockDigestEmailProps) => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Weekly Stock Alert for {storeName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Weekly Stock Report — {storeName}</Text>
            <Text style={headerSubtext}>Week of {today}</Text>
          </Section>

          <Section style={summarySection}>
            <Row>
              <Column style={summaryBox}>
                <Text style={summaryLabel}>Out of Stock</Text>
                <Text style={summaryValueDanger}>{outOfStock.length}</Text>
              </Column>
              <Column style={summaryBox}>
                <Text style={summaryLabel}>Low Stock</Text>
                <Text style={summaryValueWarning}>{lowStock.length}</Text>
              </Column>
              <Column style={summaryBox}>
                <Text style={summaryLabel}>Action Required</Text>
                <Text style={summaryValueInfo}>Reorder Now</Text>
              </Column>
            </Row>
          </Section>

          <Section style={content}>
            {outOfStock.length > 0 && (
              <>
                <Heading style={sectionTitleDanger}>🚫 Out of Stock — Order Immediately</Heading>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Medicine</th>
                      <th style={th}>Unit</th>
                      <th style={th}>Reorder Lvl</th>
                      <th style={th}>Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outOfStock.map((m) => (
                      <tr key={m.id}>
                        <td style={tdDanger}>{m.medicines.name}</td>
                        <td style={td}>{m.medicines.unit}</td>
                        <td style={td}>{m.reorder_level}</td>
                        <td style={td}>{m.suppliers?.name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {lowStock.length > 0 && (
              <>
                <Heading style={sectionTitleWarning}>📦 Low Stock — Order Soon</Heading>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Medicine</th>
                      <th style={th}>Stock</th>
                      <th style={th}>Reorder Lvl</th>
                      <th style={th}>Shortage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((m) => (
                      <tr key={m.id}>
                        <td style={tdWarning}>{m.medicines.name}</td>
                        <td style={td}>{m.stock_qty}</td>
                        <td style={td}>{m.reorder_level}</td>
                        <td style={td}>{m.reorder_level - m.stock_qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <Section style={footerCta}>
              <Button style={buttonPrimary} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suppliers/purchase-orders/new`}>
                Create Purchase Order →
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerSubtext}>
              This weekly digest is sent every Monday morning. Suppliers with email addresses on file have been notified automatically.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default LowStockDigestEmail;

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
  backgroundColor: '#1E3A5F',
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

const summarySection = {
  padding: '16px 32px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #f1f5f9',
};

const summaryBox = {
  textAlign: 'center' as const,
  padding: '8px',
};

const summaryLabel = {
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const summaryValueDanger = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#DC2626',
  margin: '0',
};

const summaryValueWarning = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#D97706',
  margin: '0',
};

const summaryValueInfo = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1E3A5F',
  margin: '0',
};

const content = {
  backgroundColor: '#fff',
  padding: '32px',
};

const sectionTitleDanger = {
  color: '#DC2626',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const sectionTitleWarning = {
  color: '#D97706',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginBottom: '24px',
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

const tdDanger = {
  ...td,
  borderLeft: '4px solid #DC2626',
  paddingLeft: '8px',
};

const tdWarning = {
  ...td,
  borderLeft: '4px solid #D97706',
  paddingLeft: '8px',
};

const footerCta = {
  textAlign: 'center' as const,
  marginTop: '16px',
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

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerSubtext = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: '1.5',
};
