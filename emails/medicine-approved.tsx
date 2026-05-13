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

interface MedicineApprovedEmailProps {
  ownerName: string;
  storeName: string;
  ownerEmail: string;
  medicineName: string;
  genericName?: string;
  contributorCount: number;
  dashboardUrl: string;
}

export const MedicineApprovedEmail = ({
  ownerName,
  medicineName,
  contributorCount,
  dashboardUrl,
}: MedicineApprovedEmailProps) => (
  <Html>
    <Head />
    <Preview>✅ Medicine Approved — {medicineName} is now global!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
            <Heading style={h1}>Your Medicine Was Approved! 🎉</Heading>
        </Section>
        <Section style={section}>
          <Text style={text}>Congratulations {ownerName}!</Text>
          <Text style={text}>
            <strong>{medicineName}</strong> has been approved and is now available
            to all MedPOS pharmacy stores across Pakistan.
          </Text>

          <Section style={milestoneCard}>
            <Text style={milestoneTitle}>🏆 You are now a MedPOS Contributor!</Text>
            <Text style={milestoneText}>
                {contributorCount === 1 ? "First contribution!" : `Contribution #${contributorCount}!`}
            </Text>
            <Text style={milestoneText}>
                Thank you for helping build Pakistan's medicine database.
            </Text>
          </Section>

          <Text style={text}>
            <strong>What this means:</strong>
          </Text>
          <ul style={list}>
            <li>Medicine now searchable by all Pakistan pharmacies</li>
            <li>Your store earned a Contributor badge</li>
            <li>Helping pharmacies nationwide serve patients better</li>
          </ul>
        </Section>

        <Section style={btnContainer}>
          <Button style={button} href={dashboardUrl}>
            View in Dashboard →
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          MedPOS — Cloud-based Pharmacy Management
        </Text>
      </Container>
    </Body>
  </Html>
);

export default MedicineApprovedEmail;

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
    backgroundColor: '#059669',
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

const milestoneCard = {
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
    textAlign: 'center' as const,
}

const milestoneTitle = {
    color: '#92400e',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 8px',
}

const milestoneText = {
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
