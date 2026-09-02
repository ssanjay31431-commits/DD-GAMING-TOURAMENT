import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();


/**
 * Send an email via Brevo HTTP v3 REST API
 */
export async function sendBrevoEmail({ toEmail, toName = '', subject, htmlContent, textContent, fromEmail, fromName }) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_BREVO_API_KEY')) {
    console.warn(`[Brevo Email Warning] BREVO_API_KEY is missing or invalid in backend/.env. Email to ${toEmail} skipped.`);
    return {
      success: false,
      skipped: true,
      message: 'Brevo API key not configured in .env file. Please add BREVO_API_KEY to backend/.env'
    };
  }

  const senderEmail = fromEmail || process.env.BREVO_SENDER_EMAIL || 'sanjaysundar000018@gmail.com';
  const senderName = fromName || process.env.BREVO_SENDER_NAME || 'DD Gaming Esports';

  const rawHtml = htmlContent || `<p>${textContent || ''}</p>`;
  const plainText = textContent && textContent.trim() ? textContent : rawHtml.replace(/<[^>]*>?/gm, '').trim();

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: toEmail.trim().toLowerCase(),
        name: toName || toEmail.split('@')[0]
      }
    ],
    subject: subject,
    htmlContent: rawHtml,
    textContent: plainText || subject
  };

  try {
    console.log(`📧 [Brevo API] Sending email to ${toEmail}... Subject: "${subject}"`);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [Brevo API Error]:', data);
      return {
        success: false,
        error: data.message || data.code || 'Brevo API returned error status',
        details: data
      };
    }

    console.log(`✅ [Brevo API Success] Email sent to ${toEmail}. Message ID: ${data.messageId || 'OK'}`);
    return {
      success: true,
      messageId: data.messageId,
      message: `Email sent successfully to ${toEmail}`
    };
  } catch (err) {
    console.error('❌ [Brevo Network Error]:', err.message);
    return {
      success: false,
      error: err.message || 'Failed to communicate with Brevo servers'
    };
  }
}

/**
 * Send automated Slot Approval Email
 */
export async function sendSlotConfirmationEmail(reg, trn = null) {
  if (!reg || !reg.email) return { success: false, message: 'No recipient email provided' };

  const tournamentName = reg.tournamentTitle || trn?.title || 'DD Gaming Esports Match';
  const tournamentDate = trn?.date || reg.tournamentDate || 'As Scheduled';
  const tournamentTime = trn?.time || reg.tournamentTime || '08:00 PM IST';
  const regStartDate = trn?.registrationStartDate || trn?.date || 'Open';
  const regStartTime = trn?.registrationStartTime || trn?.time || 'Open';
  const gameMode = trn?.mode || reg.mode || 'Esports Match';
  const gameTitle = trn?.game || reg.game || 'DD Esports';

  const subject = `✅ PAYMENT COMPLETED! Slot Confirmed - Ticket #${reg.id} - ${tournamentName}`;
  const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #080611; color: #ffffff; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #2d244f;">
      
      <!-- HEADER -->
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #7c3aed;">
        <h1 style="color: #c084fc; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">DD GAMING ESPORTS</h1>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 6px; font-weight: 600;">Official Match Ticket & Slot Confirmation</p>
      </div>

      <!-- MAIN CONTENT -->
      <div style="padding: 24px 0;">
        <div style="background-color: #064e3b; border: 1px solid #10b981; border-radius: 10px; padding: 12px 18px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: #34d399; font-size: 18px; margin: 0; text-transform: uppercase; font-weight: 800;">
            🎉 YOUR PAYMENT IS COMPLETED & CONFIRMED!
          </h2>
        </div>

        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Hello <strong style="color: #ffffff;">${reg.playerName}</strong>,<br/>
          Great news! Your entry fee payment has been successfully verified. Your slot for <strong>${tournamentName}</strong> is officially locked in. Below are your complete ticket and match schedule details.
        </p>

        <!-- FULL TICKET DETAILS TABLE -->
        <div style="background-color: #120d26; border: 1px solid #3b2d71; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h3 style="color: #c084fc; font-size: 14px; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px dashed #3b2d71; padding-bottom: 8px;">
            📋 Registration & Ticket Details
          </h3>
          <table style="width: 100%; text-align: left; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Ticket ID:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #34d399; font-family: monospace;">${reg.id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Player Name:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${reg.playerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">In-Game ID / Tag:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #c084fc; font-family: monospace;">${reg.gamingId}</td>
            </tr>
            ${reg.phone ? `
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Phone / WhatsApp:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${reg.phone}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Entry Fee Paid:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #34d399;">₹${reg.entryFee || 0} (PAID & COMPLETED)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Slot Status:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #34d399; text-transform: uppercase;">CONFIRMED ✅</td>
            </tr>
          </table>
        </div>

        <!-- FULL TOURNAMENT & MATCH SCHEDULE DETAILS TABLE -->
        <div style="background-color: #120d26; border: 1px solid #3b2d71; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h3 style="color: #38bdf8; font-size: 14px; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px dashed #3b2d71; padding-bottom: 8px;">
            🎮 Full Tournament & Match Schedule Details
          </h3>
          <table style="width: 100%; text-align: left; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Tournament Name:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #38bdf8;">${tournamentName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Game Title:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${gameTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Game Mode:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${gameMode}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Match Date:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #fbbf24;">${tournamentDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Match Start Time:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #fbbf24;">${tournamentTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Registration Schedule:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #c084fc;">${regStartDate} at ${regStartTime}</td>
            </tr>
          </table>
        </div>

        <!-- MATCH INSTRUCTIONS & LOBBY DETAILS -->
        <div style="background-color: #1e1b38; border-left: 4px solid #a855f7; border-radius: 6px; padding: 14px; margin: 20px 0;">
          <p style="color: #fbbf24; font-size: 13px; margin: 0; font-weight: bold;">
            📌 Important Match Day Instructions:
          </p>
          <ul style="color: #cbd5e1; font-size: 12px; margin-top: 6px; margin-bottom: 0; padding-left: 18px; line-height: 1.5;">
            <li>Room ID & Password will be revealed <strong>15 minutes before match start time</strong> on the DD Gaming Portal.</li>
            <li>Make sure your In-Game ID (<strong>${reg.gamingId}</strong>) matches your registered profile.</li>
            <li>Watch live streams and track rankings directly on the DD Gaming Website.</li>
          </ul>
        </div>

      </div>

      <!-- FOOTER -->
      <div style="text-align: center; border-top: 1px solid #1e1b38; padding-top: 20px; font-size: 12px; color: #64748b;">
        <p style="margin: 0;">© 2026 DD Gaming Esports. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendBrevoEmail({
    toEmail: reg.email,
    toName: reg.playerName,
    subject,
    htmlContent
  });
}

/**
 * Send automated Payment Rejection Email
 */
export async function sendPaymentRejectionEmail(reg) {
  if (!reg || !reg.email) return { success: false, message: 'No recipient email provided' };

  const subject = `⚠️ Payment Verification Status for Ticket #${reg.id} - DD Gaming`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0914; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #2d244f;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ef4444;">
        <h1 style="color: #ef4444; margin: 0; font-size: 24px; text-transform: uppercase;">DD GAMING ESPORTS</h1>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 5px;">Payment Verification Notice</p>
      </div>

      <div style="padding: 20px 0;">
        <h2 style="color: #ef4444; font-size: 20px; margin-top: 0;">❌ Payment Proof Verification Failed</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Hello <strong>${reg.playerName}</strong>,<br/>
          We were unable to verify the uploaded payment screenshot for your ticket <strong>${reg.id}</strong> (${reg.tournamentTitle}).
        </p>

        <div style="background-color: #1a0f1c; border: 1px solid #7f1d1d; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #fca5a5; font-size: 13px; margin: 0; font-weight: bold;">
            Possible Reasons:
          </p>
          <ul style="color: #cbd5e1; font-size: 13px; margin-top: 8px; padding-left: 20px;">
            <li>Screenshot was unreadable or incomplete</li>
            <li>UTR / Transaction reference number could not be matched</li>
            <li>Incorrect entry fee amount transferred</li>
          </ul>
        </div>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
          Please re-register with valid transaction details or contact DD Gaming admin support with your UTR receipt to resolve this issue.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #1e1b38; padding-top: 20px; font-size: 12px; color: #64748b;">
        <p>© 2026 DD Gaming Esports. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendBrevoEmail({
    toEmail: reg.email,
    toName: reg.playerName,
    subject,
    htmlContent
  });
}
