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

interface ContactEmailFields {
  name: string;
  email: string;
  company: string;
  message: string;
}

function buildFieldRow(label: string, value: string, isLast: boolean): string {
  const borderStyle = isLast ? '' : 'border-bottom: 1px solid #E4E9F2;';
  return `
    <tr>
      <td style="padding: 12px 0; ${borderStyle}">
        <p style="margin: 0 0 4px; font-family: Poppins, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #7C8AA5;">${label}</p>
        <p style="margin: 0; font-family: Poppins, Arial, sans-serif; font-size: 15px; color: #0F172A;">${value}</p>
      </td>
    </tr>
  `;
}

function buildContactEmailHtml(fields: ContactEmailFields): string {
  const { name, email, company, message } = fields;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeCompany = company ? escapeHtml(company) : '';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  const rows: string[] = [];
  rows.push(buildFieldRow('Nombre', safeName, false));
  rows.push(buildFieldRow('Correo', safeEmail, !company));
  if (company) {
    rows.push(buildFieldRow('Empresa', safeCompany, true));
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F7FB; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background-color: #ffffff; border: 1px solid #E4E9F2; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="background-color: #0052D4; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                <p style="margin: 0; font-family: Montserrat, Arial, sans-serif; font-size: 20px; font-weight: 700; color: #ffffff;">Synthetix AI</p>
                <p style="margin: 4px 0 0; font-family: Poppins, Arial, sans-serif; font-size: 13px; color: #CBD4E5;">Nuevo mensaje de contacto</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${rows.join('')}
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                  <tr>
                    <td>
                      <p style="margin: 0 0 8px; font-family: Poppins, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #7C8AA5;">Mensaje</p>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F7FB; border-left: 4px solid #0052D4;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <p style="margin: 0; font-family: Poppins, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #0F172A;">${safeMessage}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color: #F4F7FB; border-top: 1px solid #E4E9F2; padding: 16px 32px; border-radius: 0 0 12px 12px;">
                <p style="margin: 0; font-family: Poppins, Arial, sans-serif; font-size: 12px; color: #7C8AA5;">Responde directamente a este correo para contactar a ${safeName}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function buildContactEmailText(fields: ContactEmailFields): string {
  const { name, email, company, message } = fields;
  const lines = [`Nombre: ${name}`, `Correo: ${email}`];
  if (company) {
    lines.push(`Empresa: ${company}`);
  }
  lines.push('', 'Mensaje:', message);
  return lines.join('\n');
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
    html: buildContactEmailHtml({ name, email, company, message }),
    text: buildContactEmailText({ name, email, company, message }),
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'send_failed' }), { status: 502 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
