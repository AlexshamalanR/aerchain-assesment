import nodemailer from "nodemailer";
import { config } from "./config";

// Create transporter (configure based on your email service)
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

interface SendRFPEmailOptions {
  vendorEmail: string;
  vendorName: string;
  rfpTitle: string;
  rfpContent: string;
  rfpId: string;
  replyTo?: string;
}

/**
 * Send RFP to vendor via email
 */
export async function sendRFPEmail(options: SendRFPEmailOptions): Promise<void> {
  const {
    vendorEmail,
    vendorName,
    rfpTitle,
    rfpContent,
    rfpId,
    replyTo = config.senderEmail,
  } = options;

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2>Request for Proposal: ${rfpTitle}</h2>
          <hr />
          <p>Dear ${vendorName},</p>
          <p>We are requesting your proposal for the following procurement need:</p>
          <hr />
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            ${rfpContent.replace(/\n/g, "<br />")}
          </div>
          <hr />
          <p>Please reply to this email with your detailed proposal, including pricing, delivery timeline, payment terms, and warranty information.</p>
          <p><strong>RFP Reference ID:</strong> ${rfpId}</p>
          <p>Thank you for your time.</p>
          <p>Best regards,<br />Procurement Team</p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Request for Proposal: ${rfpTitle}

Dear ${vendorName},

We are requesting your proposal for the following procurement need:

${rfpContent}

Please reply to this email with your detailed proposal, including pricing, delivery timeline, payment terms, and warranty information.

RFP Reference ID: ${rfpId}

Thank you for your time.

Best regards,
Procurement Team
  `;

  const result = await transporter.sendMail({
    from: config.senderEmail,
    to: vendorEmail,
    subject: `RFP: ${rfpTitle}`,
    text: textContent,
    html: htmlContent,
    replyTo,
  });

  console.log(`✅ RFP sent to ${vendorEmail}:`, result.messageId);
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("✅ Email configuration verified");
    return true;
  } catch (error) {
    console.error("❌ Email configuration error:", error);
    return false;
  }
}
