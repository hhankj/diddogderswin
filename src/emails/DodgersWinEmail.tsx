import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface DodgersWinEmailProps {
  testMessage?: string;
}

export const DodgersWinEmail = ({
  testMessage = "This is a test email for Henry's project!"
}: DodgersWinEmailProps) => {
  const previewText = "Test email from Henry's Dodgers project";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Los_Angeles_Dodgers_Logo.svg"
                width="40"
                height="37"
                alt="Dodgers"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              📧 <strong>Test Email</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello there!
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              {testMessage}
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-blue-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3 block w-full"
                href="https://github.com"
              >
                🚀 View Project
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              This is a demonstration email template created for testing purposes.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              The email system is working correctly if you can see this message.
            </Text>
            <Text className="text-gray-500 text-[12px] leading-[24px] mt-[32px]">
              If you&apos;re receiving this, it&apos;s a test email for Henry&apos;s project
            </Text>
            <Text className="text-gray-500 text-[12px] leading-[24px]">
              <Link
                href={`mailto:henry@example.com?subject=Test Email Feedback`}
                className="text-blue-600 no-underline"
              >
                Contact Henry
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DodgersWinEmail; 