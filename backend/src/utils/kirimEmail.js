// Pengiriman email laporan ke developer.
// Memakai Nodemailer + SMTP bila dikonfigurasi di .env; jika tidak, berjalan
// dalam mode SIMULASI (pesan dicatat di log server) sehingga fitur tetap jalan
// tanpa kredensial. Nodemailer di-require secara lazy agar app tetap dapat
// dimuat meskipun paketnya belum ter-install.
let nodemailer = null;
try {
  // eslint-disable-next-line global-require
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

const emailDikonfigurasi = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

// Email tujuan default = email developer (bisa di-override lewat .env).
const EMAIL_DEVELOPER = process.env.LAPORAN_EMAIL || 'stephenbaldwin2005s@gmail.com';

async function kirimEmail({ subjek, teks, replyTo }) {
  if (!nodemailer || !emailDikonfigurasi()) {
    console.log(
      `[Email - simulasi] ke ${EMAIL_DEVELOPER}\nSubjek: ${subjek}\n${teks}\n` +
        '(Isi SMTP_HOST/SMTP_USER/SMTP_PASS di .env untuk benar-benar mengirim email.)'
    );
    return { terkirim: false, simulasi: true };
  }

  try {
    const port = Number(process.env.SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Lapor Tabungan Qurban" <${process.env.SMTP_USER}>`,
      to: EMAIL_DEVELOPER,
      replyTo: replyTo || undefined,
      subject: subjek,
      text: teks,
    });
    return { terkirim: true };
  } catch (err) {
    console.error('Gagal mengirim email laporan:', err.message);
    return { terkirim: false, alasan: err.message };
  }
}

module.exports = { kirimEmail, emailDikonfigurasi, EMAIL_DEVELOPER };
