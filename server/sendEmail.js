import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/send-email", async (req, res) => {
  const { to, subject, html } = req.body;

  const msg = {
    to,
    from: "bencuddy1@gmail.com",
    subject,
    html
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent to:", to);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ SendGrid error:", err.response?.body || err.message);
    res.status(500).json({ success: false, error: err });
  }
});

export default router;
