import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/rfp_db",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  imapHost: process.env.IMAP_HOST || "imap.gmail.com",
  imapPort: parseInt(process.env.IMAP_PORT || "993"),
  imapUser: process.env.IMAP_USER || "",
  imapPass: process.env.IMAP_PASS || "",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  senderEmail: process.env.SENDER_EMAIL || "noreply@rfpsystem.com",
  nodeEnv: process.env.NODE_ENV || "development",
};
