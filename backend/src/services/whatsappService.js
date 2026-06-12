// Pengiriman notifikasi WhatsApp.
// Tanpa WHATSAPP_API_TOKEN, berjalan dalam mode simulasi (pesan dicatat di log
// server) — siap disambungkan ke provider seperti Fonnte/Twilio cukup dengan
// mengisi token di .env.

function normalisasiNomor(noTelp) {
  const bersih = String(noTelp || '').replace(/[\s\-+]/g, '');
  if (bersih.startsWith('08')) return `62${bersih.slice(1)}`;
  if (bersih.startsWith('628')) return bersih;
  return null;
}

// Validasi format nomor seluler Indonesia (kandidat nomor WhatsApp).
function nomorWhatsAppValid(noTelp) {
  const nomor = normalisasiNomor(noTelp);
  return nomor !== null && /^628\d{8,11}$/.test(nomor);
}

async function kirimWhatsApp(noTelp, pesan) {
  if (!nomorWhatsAppValid(noTelp)) {
    return { terkirim: false, alasan: 'Nomor bukan format WhatsApp yang valid' };
  }
  const nomor = normalisasiNomor(noTelp);
  const token = process.env.WHATSAPP_API_TOKEN;

  if (!token) {
    console.log(`[WhatsApp - simulasi] ke ${nomor}: ${pesan}`);
    return { terkirim: true, simulasi: true };
  }

  try {
    // Format API Fonnte (provider WhatsApp gateway populer di Indonesia).
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: nomor, message: pesan }),
    });
    if (!res.ok) throw new Error(`Provider menjawab ${res.status}`);
    return { terkirim: true };
  } catch (err) {
    // Kegagalan WhatsApp tidak boleh menggagalkan proses utama.
    console.error('Gagal mengirim WhatsApp:', err.message);
    return { terkirim: false, alasan: err.message };
  }
}

module.exports = { kirimWhatsApp, nomorWhatsAppValid };
