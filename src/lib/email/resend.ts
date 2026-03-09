import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM = process.env.RESEND_FROM!;
const REPLY_TO = process.env.RESEND_REPLY_TO;

export const resend = new Resend(RESEND_API_KEY);

export async function sendOrderEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: REPLY_TO ? [REPLY_TO] : undefined,
  });
}