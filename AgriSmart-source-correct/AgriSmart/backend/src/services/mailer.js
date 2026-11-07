const nodemailer = require('nodemailer');

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : null;

/** Best effort: lỗi gửi email không bao giờ làm hỏng đơn hàng. */
async function sendMail({ to, subject, text }) {
  try {
    if (!transporter) {
      console.log(`[MAIL:dev] To: ${to} | ${subject}`);
      return;
    }
    await transporter.sendMail({ from: process.env.MAIL_FROM || 'AgriSmart <no-reply@agrismart.local>', to, subject, text });
  } catch (e) {
    console.error('Gửi email thất bại:', e.message);
  }
}

module.exports = { sendMail };
