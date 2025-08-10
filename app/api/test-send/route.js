import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const testEmail = 'lilyreitsma@icloud.com'; // Change if needed

  try {
    console.log("Attempting to send test email to:", testEmail);

    const emailHtml = `
      <html>
      <body>
        <h1>Test Email from TA Hours Tracker</h1>
        <p>This is a test to check if Resend accepts the request.</p>
      </body>
      </html>
    `;

    const emailData = await resend.emails.send({
      from: 'DanceXcel <onboarding@resend.dev>', // Use your verified 'from' address here
      to: testEmail,
      subject: 'Test Email from TA Hours Tracker',
      html: emailHtml,
    });

    console.log("Resend API response:", emailData);

    res.status(200).json({ success: true, data: emailData });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
