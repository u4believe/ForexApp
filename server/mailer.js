const { Resend } = require('resend');

let resend = null;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const FROM = 'CapitalPip Markets <noreply@capitalpipmarkets.com>';

async function sendMail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email not sent');
    return;
  }
  const { error } = await getResend().emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
}

module.exports = { sendMail };
