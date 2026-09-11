#!/usr/bin/env node
/**
 * Real end-to-end test of the "Forward to Internal Member" email capture
 * flow described in the Customer Approvals prototype — run this on your
 * own machine (not in a sandboxed environment), since it needs a live
 * SMTP + IMAP connection to Gmail.
 *
 * What it does:
 *   1. Sends a real email from GMAIL_USER to TEST_RECIPIENT, with the
 *      Approval ID in the subject line — exactly like the CSM's
 *      "Forward to Internal Member" action.
 *   2. Polls the same mailbox's inbox for a reply whose subject still
 *      contains that Approval ID.
 *   3. When found, prints the respondent's name/email, timestamp, and
 *      body — this is exactly what the app would show under
 *      "Internal Response Received", captured automatically with no
 *      manual copy/paste.
 *
 * Setup:
 *   npm install nodemailer imapflow mailparser
 *
 *   1. On the Gmail account you're sending from (GMAIL_USER), turn on
 *      2-Step Verification: myaccount.google.com/security
 *   2. Create an App Password: myaccount.google.com/apppasswords
 *      (choose "Mail" as the app) — use that as GMAIL_APP_PASSWORD.
 *      Do NOT use your normal account password.
 *   3. Make sure IMAP is enabled: Gmail Settings -> "Forwarding and
 *      POP/IMAP" -> Enable IMAP.
 *
 * Run:
 *   GMAIL_USER=khushi.work9471@gmail.com \
 *   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx \
 *   TEST_RECIPIENT=your-other-email@example.com \
 *   node test-email-capture.mjs
 *
 * Then check TEST_RECIPIENT's inbox, reply to the email (any content),
 * and watch this script pick it up within ~10 seconds.
 */

import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

const GMAIL_USER = requireEnv('GMAIL_USER');
const APP_PASSWORD = requireEnv('GMAIL_APP_PASSWORD');
const RECIPIENT = requireEnv('TEST_RECIPIENT');

const APPROVAL_ID = 'APP-001';
const SUBJECT = `[${APPROVAL_ID}] Engineer Input Required – HPT Blade Additional Repair`;
const POLL_INTERVAL_MS = 10_000;
const MAX_ATTEMPTS = 60; // ~10 minutes

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function sendForwardEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: APP_PASSWORD },
  });

  const body = [
    `[${APPROVAL_ID}] O&A — Additional Repair`,
    'Item / Part: PN 123456 — HPT Blade',
    'Requirement: HPT blade requires additional repair beyond the original',
    'approved workscope due to inspection findings.',
    'Cost: $12,500',
    '',
    "CSM question: Customer has requested an engineer's recommendation.",
    'Please advise whether we should proceed with the repair or replace the part.',
    '',
    '--',
    'Reply directly to this email. Your reply will be captured automatically',
    'against this approval — no need to log into anything.',
  ].join('\n');

  const info = await transporter.sendMail({
    from: GMAIL_USER,
    to: RECIPIENT,
    subject: SUBJECT,
    text: body,
  });

  console.log(`Sent "${SUBJECT}" to ${RECIPIENT}`);
  console.log(`Message-Id: ${info.messageId}`);
  console.log('');
  console.log(`Now go reply to that email from ${RECIPIENT}'s inbox...`);
}

async function pollForReply() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: GMAIL_USER, pass: APP_PASSWORD },
    logger: false,
  });

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');

  try {
    console.log(`Polling INBOX every ${POLL_INTERVAL_MS / 1000}s for a reply containing "${APPROVAL_ID}"...`);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const uids = await client.search({ subject: APPROVAL_ID }, { uid: true });

      for (const uid of uids ?? []) {
        const { source } = await client.fetchOne(uid, { source: true });
        const parsed = await simpleParser(source);
        const fromAddress = parsed.from?.value?.[0]?.address ?? '';

        // Skip the message we sent ourselves; we want the reply.
        if (fromAddress.toLowerCase() === GMAIL_USER.toLowerCase()) continue;

        const respondentName = parsed.from?.value?.[0]?.name || fromAddress;

        console.log('');
        console.log('=== Response Received (captured automatically from email) ===');
        console.log(`Respondent: ${respondentName} <${fromAddress}>`);
        console.log(`Date:       ${parsed.date?.toLocaleString() ?? 'unknown'}`);
        console.log(`Subject:    ${parsed.subject}`);
        console.log(`Approval:   ${APPROVAL_ID} (identified from subject line)`);
        console.log('Body:');
        console.log((parsed.text ?? '(no plain-text body)').trim());
        if (parsed.attachments?.length) {
          console.log(`Attachments: ${parsed.attachments.map((a) => a.filename).join(', ')}`);
        }
        console.log('================================================================');
        return;
      }

      process.stdout.write(`  attempt ${attempt}/${MAX_ATTEMPTS}: no reply yet...\r`);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    console.log('\nTimed out waiting for a reply. Run again once you have replied, or increase MAX_ATTEMPTS.');
  } finally {
    lock.release();
    await client.logout();
  }
}

await sendForwardEmail();
await pollForReply();
