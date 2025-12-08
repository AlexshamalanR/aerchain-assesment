import Imap from "imap";
import { simpleParser } from "mailparser";
import { prisma } from "../db";
import { parseVendorProposal } from "../ai";

let imap: Imap;


// Remove Re:, Fwd:, and leading "RFP:" from email subject
function normalizeSubject(subject: string): string {
  return subject.replace(/^(Re:|Fwd:|FW:)\s*/i, "") // remove replies/forwards
                .replace(/^RFP:\s*/i, "")           // remove leading "RFP:"
                .trim();
}


/**
 * Start listening to incoming emails via IMAP
 */
export function startEmailListener() {
  console.log("📨 Starting IMAP listener...");

  imap = new Imap({
    user: process.env.IMAP_USER!,
    password: process.env.IMAP_PASS!,
    host: process.env.IMAP_HOST!,
    port: Number(process.env.IMAP_PORT!),
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  // Event handlers
  imap.once("ready", handleReady);
  imap.once("error", (err: any) => console.error("❌ IMAP Error:", err));
  imap.once("close", () => {
    console.log("🔄 IMAP Connection closed. Reconnecting in 5s...");
    setTimeout(startEmailListener, 5000);
  });

  imap.connect();
}

/**
 * IMAP ready handler
 */
function handleReady() {
  console.log("📬 IMAP connected!");
  openInbox(() => {
    console.log("📥 Inbox opened. Entering IDLE mode...");

    // Listen for new incoming emails
    imap.on("mail", () => {
      console.log("📧 New mail detected! Fetching...");
      fetchAndProcessEmails();
    });

    // Fetch unread emails on startup
    fetchAndProcessEmails();
  });
}

/**
 * Open inbox helper
 */
function openInbox(cb: (err?: Error) => void) {
  imap.openBox("INBOX", false, cb);
}

/**
 * Fetch and process unread emails
 */
async function fetchAndProcessEmails() {
  try {
    const emails = await fetchUnreadEmails();
    if (emails.length === 0) {
      console.log("📭 No new unread emails");
      return;
    }

    for (const raw of emails) {
      await processEmail(raw);
    }
  } catch (err) {
    console.error("❌ Failed to fetch/process emails:", err);
  }
}

/**
 * Fetch unread emails from IMAP
 */
function fetchUnreadEmails(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    imap.search(["UNSEEN"], (err, results) => {
      if (err) return reject(err);
      if (!results || results.length === 0) return resolve([]);

      const f = imap.fetch(results, { bodies: "", markSeen: true });
      const emails: string[] = [];

      f.on("message", (msg) => {
        let buffer = "";

        msg.on("body", (stream) => {
          stream.on("data", (chunk) => (buffer += chunk.toString("utf8")));
        });

        msg.once("end", () => emails.push(buffer));
      });

      f.once("error", reject);
      f.once("end", () => resolve(emails));
    });
  });
}

/**
 * Process individual email
 */
async function processEmail(rawEmail: string) {
  const parsed = await simpleParser(rawEmail);

  const vendorEmail = parsed.from?.value[0].address;
  let subject = parsed.subject || "";
  const body = parsed.text?.trim() || "";

  console.log(`📩 Incoming email from ${vendorEmail} | subject="${subject}"`);

  if (!vendorEmail || !subject) return;

  // Normalize subject
  const cleanedSubject = normalizeSubject(subject);

  // (1) Find vendor
  const vendor = await prisma.vendor.findUnique({
    where: { email: vendorEmail },
  });
  if (!vendor) {
    console.log(`⚠️ No vendor found: ${vendorEmail}`);
    return;
  }

  // (2) Find matching RFP
  const rfp = await prisma.rFP.findFirst({
    where: {
      title: { contains: cleanedSubject, mode: "insensitive" },
    },
  });
  if (!rfp) {
    console.log(`⚠️ No RFP matches subject: "${cleanedSubject}"`);
    return;
  }

  // (3) Parse proposal using AI
  const parsedJson = await parseVendorProposal(body, "");

  // Convert to plain object for Prisma compatibility
  const jsonForPrisma = JSON.parse(JSON.stringify(parsedJson));

  // (4) Save or update proposal
  await prisma.proposal.upsert({
    where: { rfpId_vendorId: { rfpId: rfp.id, vendorId: vendor.id } },
    update: {
      rawEmailBody: body,
      parsedJson: jsonForPrisma,
      totalPrice: parsedJson.totalPrice,
      currency: parsedJson.currency,
      deliveryDays: parsedJson.deliveryDays,
      paymentTerms: parsedJson.paymentTerms,
      warrantyMonths: parsedJson.warrantyMonths,
      completenessScore: parsedJson.completenessPercentage,
      updatedAt: new Date(),
    },
    create: {
      rfpId: rfp.id,
      vendorId: vendor.id,
      rawEmailBody: body,
      parsedJson: jsonForPrisma,
      totalPrice: parsedJson.totalPrice,
      currency: parsedJson.currency,
      deliveryDays: parsedJson.deliveryDays,
      paymentTerms: parsedJson.paymentTerms,
      warrantyMonths: parsedJson.warrantyMonths,
      completenessScore: parsedJson.completenessPercentage,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Proposal saved for ${vendorEmail}`);
}