import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendHourConfirmationEmail({ ta_name, ta_email, date, hours, notes }) {
  try {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const emailHtml = `
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hours Logged Confirmation</title>
  <style>
    /* Reset and base */
    body, html {
      margin: 0; padding: 0; height: 100%; width: 100%;
      background-color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    a {
      color: #d4af37;
      text-decoration: none;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(212, 175, 55, 0.15);
      padding: 30px 40px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #d4af37;
      margin-bottom: 8px;
    }
    h1 {
      font-weight: 700;
      font-size: 24px;
      color: #333;
      margin: 0;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
      margin: 15px 0;
    }
    .details {
      background: #f9f7ef;
      border-radius: 10px;
      padding: 20px 25px;
      margin: 25px 0;
      box-shadow: inset 0 0 12px rgba(212, 175, 55, 0.2);
    }
    .details h2 {
      margin-top: 0;
      color: #b68a00;
      font-weight: 700;
      font-size: 20px;
      margin-bottom: 15px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-weight: 600;
      color: #444;
    }
    .detail-row span:last-child {
      font-weight: 400;
      color: #222;
      max-width: 60%;
      text-align: right;
      word-break: break-word;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #999;
      margin-top: 30px;
      line-height: 1.4;
    }
    /* Responsive */
    @media (max-width: 480px) {
      .container {
        margin: 20px;
        padding: 25px 20px;
      }
      h1 {
        font-size: 20px;
      }
      .details h2 {
        font-size: 18px;
      }
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
      }
      .detail-row span:last-child {
        max-width: 100%;
        text-align: left;
        margin-top: 3px;
      }
    }
  </style>
</head>
<body>
  <div class="container" role="article" aria-label="Hours Logged Confirmation Email">
    <header class="header">
      <div class="logo">🎭 Dance Studio TA Tracker</div>
      <h1>Hours Logged Successfully!</h1>
    </header>

    <p>Hi <strong>${ta_name}</strong>,</p>

    <p>Thank you for logging your teaching assistant hours. Below are the details of your submission:</p>

    <section class="details" aria-labelledby="details-title">
      <h2 id="details-title">Logged Hours Details</h2>
      <div class="detail-row">
        <span>Date:</span>
        <span>${formattedDate}</span>
      </div>
      <div class="detail-row">
        <span>Hours:</span>
        <span>${hours} ${hours === 1 ? 'hour' : 'hours'}</span>
      </div>
      ${
        notes
          ? `<div class="detail-row">
               <span>Notes:</span>
               <span>${notes}</span>
             </div>`
          : ''
      }
      <div class="detail-row">
        <span>Logged At:</span>
        <span>${new Date().toLocaleString()}</span>
      </div>
    </section>

    <p>If you have any questions or notice any errors, please <a href="mailto:${process.env.REPLY_TO_EMAIL}">contact the studio administrator</a> immediately.</p>

    <p>Thanks for your dedication to our studio!</p>

    <footer class="footer" role="contentinfo">
      <p>This is an automated confirmation email from the TA Hours Tracking System.</p>
      <p>Please do not reply to this email.</p>
    </footer>
  </div>
</body>
</html>
`


    const emailData = await resend.emails.send({
      from: 'DanceXcel <onboarding@resend.dev>',
      to: ta_email,
      replyTo: process.env.REPLY_TO_EMAIL,
      subject: 'Hours Logged Confirmation - Dance Studio',
      html: emailHtml
    })

    return { success: true, id: emailData.id }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}