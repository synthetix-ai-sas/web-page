import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const TO_EMAIL = import.meta.env.CONTACT_TO_EMAIL || 'contact@synthetixaisas.com';
const FROM_EMAIL = import.meta.env.CONTACT_FROM_EMAIL;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  // Honeypot: real users never fill this hidden field, bots often do.
  const honeypot = typeof body.website === 'string' ? body.website.trim() : '';

  if (honeypot) {
    // Silently pretend success so bots don't learn the field is checked.
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !message || !emailPattern.test(email)) {
    return new Response(JSON.stringify({ error: 'invalid_fields' }), { status: 400 });
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey || !FROM_EMAIL) {
    return new Response(JSON.stringify({ error: 'not_configured' }), { status: 500 });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: email,
    subject: `Nuevo contacto: ${name}${company ? ` (${company})` : ''}`,
    html: `
      <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p><strong>Correo:</strong> ${escapeHtml(email)}</p>
      ${company ? `<p><strong>Empresa:</strong> ${escapeHtml(company)}</p>` : ''}
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'send_failed' }), { status: 502 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
