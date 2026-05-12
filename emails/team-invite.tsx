import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface TeamInviteEmailProps {
  inviteeName: string;
  storeName: string;
  inviterName: string;
  role: string;
  personalMessage?: string;
  acceptUrl: string;
  expiresAt: string;
}

export const TeamInviteEmail = ({
  inviteeName,
  storeName,
  inviterName,
  role,
  personalMessage,
  acceptUrl,
  expiresAt,
}: TeamInviteEmailProps) => {
  const previewText = `${inviterName} invited you to join ${storeName} on MedPOS`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-5 pb-12">
            <Section className="bg-[#1E3A5F] p-8 text-center rounded-t-lg">
              <Heading className="text-white text-2xl m-0">MedPOS</Heading>
            </Section>
            <Section className="px-8 py-10 border border-t-0 border-gray-200 rounded-b-lg">
              <Text className="text-gray-700 text-lg">
                Assalam-o-Alaikum {inviteeName},
              </Text>
              <Text className="text-gray-700">
                <strong>{inviterName}</strong> has invited you to join <strong>{storeName}</strong> as a <strong>{role}</strong> on MedPOS — Pakistan's medical store management system.
              </Text>

              {personalMessage && (
                <Section className="bg-gray-50 p-4 rounded my-6 border-l-4 border-gray-300">
                  <Text className="italic text-gray-600 m-0">"{personalMessage}"</Text>
                  <Text className="text-right text-gray-500 text-sm mt-2 m-0">— {inviterName}</Text>
                </Section>
              )}

              <Section className="bg-blue-50 p-6 rounded-lg my-8 text-center">
                <Text className="m-0 text-gray-700">Your role: <strong>{role}</strong></Text>
                <Button
                  className="bg-[#1E3A5F] rounded text-white text-xs font-semibold no-underline text-center px-6 py-3 mt-4"
                  href={acceptUrl}
                >
                  Accept Invitation →
                </Button>
              </Section>

              <Text className="text-gray-500 text-xs">
                This invitation expires on {expiresAt}.
              </Text>
              <Text className="text-gray-500 text-xs">
                If you already have a MedPOS account, you will be linked to {storeName} after accepting.
              </Text>

              <Hr className="border-gray-200 my-6" />

              <Text className="text-gray-400 text-xs">
                If you did not expect this invitation, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TeamInviteEmail;
