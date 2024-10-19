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
  Text
} from '@react-email/components';
import * as React from 'react';

interface WorkFromHomeApprovalEmailProps {
  recipientName?: string;
  requesterName?: string;
  date?: string;
  departmentName?: string;
}

export const WorkFromHomeApprovalEmail = ({
  recipientName = 'Manager',
  requesterName = 'John Doe',
  date = 'Monday, October 23, 2023',
  departmentName = 'Marketing'
}: WorkFromHomeApprovalEmailProps) => {
  const baseUrl = 'https://example.com';

  return (
    <Html>
      <Head />
      <Preview>Action Required: Work from Home Request</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Img
            src={`${baseUrl}/static/logo.png`}
            width="170"
            height="50"
            alt="Company Logo"
            style={styles.logo}
          />
          <Heading style={styles.heading}>Work from Home Request</Heading>
          <Text style={styles.text}>Hello {recipientName},</Text>
          <Text style={styles.text}>
            {requesterName} from {departmentName} has submitted a request to
            work from home on {date}. Your approval is required to proceed.
          </Text>

          {/* Centered Dashboard Button Section */}
          <Section style={styles.buttonContainer}>
            <Button
              style={styles.dashboardButton}
              href="http://localhost:3001/dashboard"
            >
              Go to your dashboard
            </Button>
          </Section>

          <Text style={styles.text}>
            Alternatively, you can manage this request by logging into the HR
            portal.
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            This is an automated email. Please do not reply directly. For any
            questions, contact{' '}
            <Link href="mailto:hr@example.com" style={styles.link}>
              HR@example.com
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WorkFromHomeApprovalEmail;

const styles = {
  main: {
    backgroundColor: '#f3f4f6',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  container: {
    margin: '0 auto',
    padding: '24px',
    width: '600px',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  logo: {
    margin: '0 auto 24px',
    display: 'block'
  },
  heading: {
    color: '#111827',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '16px'
  },
  text: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  buttonContainer: {
    textAlign: 'center' as const,
    marginTop: '24px'
  },
  dashboardButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    textDecoration: 'none'
  },
  hr: {
    border: '1px solid #e5e7eb',
    marginTop: '24px'
  },
  footer: {
    color: '#6b7280',
    fontSize: '12px',
    lineHeight: '1.5',
    textAlign: 'center' as const
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'underline'
  }
};
