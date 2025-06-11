import { generateEmailHTML } from "../formatEmailHTML";

export const handleSendEmail = async ({ user, articles }) => {
  if (!user?.email) {
    alert("No email found for current user.");
    return;
  }

  if (articles.length === 0) {
    alert("No articles to send.");
    return;
  }

  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: user.email,
      subject: "Your Crypto Digest from The InkQuirer",
      html: generateEmailHTML(articles),
    }),
  });

  const result = await res.json();

  if (result.success) {
    alert("📬 Email sent successfully!");
  } else {
    alert("❌ Failed to send email.");
  }
};
