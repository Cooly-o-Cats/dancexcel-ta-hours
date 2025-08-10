import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request) {
  const testEmail = 'lilyreitsma@icloud.com';

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

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
