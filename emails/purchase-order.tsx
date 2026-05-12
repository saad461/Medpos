import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  render,
} from '@react-email/components'
import * as React from 'react'

interface POEmailProps {
  supplierName: string
  storeName: string
  storePhone: string
  poNumber: string
  poDate: string
  expectedDelivery: string
  items: { name: string, qty: number, unitPrice: number }[]
  totalAmount: number
  notes?: string
  logoUrl?: string
}

export const PurchaseOrderEmail = ({
  supplierName,
  storeName,
  storePhone,
  poNumber,
  poDate,
  expectedDelivery,
  items,
  totalAmount,
  notes,
  logoUrl,
}: POEmailProps) => (
  <Html>
    <Head />
    <Preview>Purchase Order {poNumber} from {storeName}</Preview>
    <Body style={main}>
      <Container style={container}>
        {logoUrl && <Img src={logoUrl} width="100" height="100" alt={storeName} style={logo} />}
        <Heading style={h1}>Purchase Order</Heading>
        <Text style={text}>
          Dear <strong>{supplierName}</strong>,
        </Text>
        <Text style={text}>
          Please find the following purchase order from <strong>{storeName}</strong>.
        </Text>

        <Section style={detailsContainer}>
          <Text style={detailText}><strong>PO Number:</strong> {poNumber}</Text>
          <Text style={detailText}><strong>Date:</strong> {poDate}</Text>
          <Text style={detailText}><strong>Expected Delivery:</strong> {expectedDelivery}</Text>
        </Section>

        <Section style={tableContainer}>
          <table style={table}>
            <thead>
              <tr style={tableHeader}>
                <th style={th}>Medicine</th>
                <th style={th}>Qty</th>
                <th style={th}>Unit Price</th>
                <th style={th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={tableRow}>
                  <td style={td}>{item.name}</td>
                  <td style={td}>{item.qty}</td>
                  <td style={td}>Rs. {item.unitPrice.toLocaleString()}</td>
                  <td style={td}>Rs. {(item.qty * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section style={totalSection}>
          <Text style={totalText}><strong>Total Amount: Rs. {totalAmount.toLocaleString()}</strong></Text>
        </Section>

        {notes && (
          <Section style={notesContainer}>
            <Text style={detailText}><strong>Notes:</strong> {notes}</Text>
          </Section>
        )}

        <Hr style={hr} />

        <Text style={footer}>
          {storeName} | {storePhone}
          <br />
          Please confirm receipt of this order.
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logo = {
  margin: '0 auto',
  marginBottom: '20px',
}

const h1 = {
  color: '#1E3A5F',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 48px',
}

const detailsContainer = {
  padding: '20px 48px',
  backgroundColor: '#f9f9f9',
  margin: '20px 0',
}

const detailText = {
  margin: '5px 0',
  fontSize: '14px',
  color: '#333',
}

const tableContainer = {
  padding: '0 48px',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const tableHeader = {
  backgroundColor: '#1E3A5F',
  color: '#ffffff',
}

const th = {
  textAlign: 'left' as const,
  padding: '10px',
  fontSize: '12px',
}

const tableRow = {
  borderBottom: '1px solid #e1e1e1',
}

const td = {
  padding: '10px',
  fontSize: '12px',
  color: '#333',
}

const totalSection = {
  padding: '20px 48px',
  textAlign: 'right' as const,
}

const totalText = {
  fontSize: '18px',
  color: '#1E3A5F',
}

const notesContainer = {
  padding: '0 48px',
  marginBottom: '20px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
}
