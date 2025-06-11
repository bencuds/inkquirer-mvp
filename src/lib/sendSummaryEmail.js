import sgMail from "@sendgrid/mail";

sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY); // or use process.env on a server

export async function sendSummaryEmail({ to, subject, html }) {
  const msg = {
    to,
    from: 'your_verified_email@example.com', // this must match your verified sender
    subject,
    html
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent");
    return { success: true };
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.body || error.message);
    return { success: false, error };
  }
}
