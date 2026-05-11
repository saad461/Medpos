import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface AccountApprovedEmailProps {
  storeName: string;
  ownerName: string;
  email: string;
  planName: string;
  loginUrl: string;
  adminMessage?: string;
  whatsappNumber: string;
}

export const AccountApprovedEmail = ({
  storeName,
  ownerName,
  email,
  planName,
  loginUrl,
  adminMessage,
  whatsappNumber,
}: AccountApprovedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your MedPOS account is approved! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={headerText}>Your Account is Approved! 🎉</Heading>
        </Section>
        <Container style={content}>
          <Text style={paragraph}>Assalam-o-Alaikum {ownerName},</Text>
          <Text style={paragraph}>
            Great news! Your MedPOS account for <strong>{storeName}</strong> has been approved.
            You can now log in and start managing your store.
          </Text>

          {adminMessage && (
            <Section style={messageBox}>
              <Text style={messageText}>"{adminMessage}"</Text>
              <Text style={messageSignoff}>— MedPOS Team</Text>
            </Section>
          )}

          <Heading style={subheading}>What to do now:</Heading>
          <Text style={paragraph}>
            1. Log in to your dashboard<br />
            2. Add your medicines (we have 3,000+ Pakistan medicines ready)<br />
            3. Follow the guided tour<br />
            4. Make your first sale
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Open My Dashboard →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={paragraph}>Getting Started tips:</Text>
          <ul style={list}>
            <li>Watch the <Link href="#">Urdu tutorial</Link></li>
            <li>WhatsApp us anytime: {whatsappNumber}</li>
            <li>Your 14-day trial started today</li>
          </ul>

          <Hr style={hr} />
          <Text style={footer}>
            © 2026 MedPOS — Medical Store Management System<br />
            Built for Pakistani Pharmacies
          </Text>
        </Container>
      </Container>
    </Body>
  </Html>
);

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', marginBottom: '64px' };
const header = { backgroundColor: '#059669', padding: '32px', textAlign: 'center' as const };
const headerText = { color: '#ffffff', fontSize: '24px', fontWeight: 'bold', margin: '0' };
const content = { padding: '40px' };
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#484848' };
const messageBox = { backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '8px', margin: '24px 0', borderLeft: '4px solid #059669' };
const messageText = { fontSize: '15px', fontStyle: 'italic', margin: '0', color: '#166534' };
const messageSignoff = { fontSize: '13px', fontWeight: 'bold', marginTop: '8px', color: '#166534' };
const subheading = { fontSize: '18px', fontWeight: 'bold', color: '#1E3A5F', marginTop: '32px' };
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = { backgroundColor: '#1E3A5F', color: '#fff', padding: '16px 32px', borderRadius: '5px', fontWeight: 'bold', textDecoration: 'none' };
const hr = { borderColor: '#e2e8f0', margin: '32px 0' };
const list = { fontSize: '14px', color: '#484848', paddingLeft: '20px' };
const footer = { color: '#8898aa', fontSize: '12px', textAlign: 'center' as const };

export default AccountApprovedEmail;
