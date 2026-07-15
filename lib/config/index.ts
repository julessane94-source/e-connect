// lib/config/index.ts
export const config = {
  app: {
    name: "Sedhiou-connect",
    version: "1.0.0",
    description: "Digitalisation des services municipaux de Sédhiou",
  },
  auth: {
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 jours
    cookieSecure: process.env.NODE_ENV === "production",
  },
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || "10485760"),
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || "image/jpeg,image/png,image/gif,application/pdf").split(","),
    path: "./uploads",
  },
  qr: {
    size: parseInt(process.env.QR_CODE_SIZE || "200"),
    level: process.env.QR_CODE_LEVEL || "H",
  },
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    from: process.env.SMTP_FROM || "noreply@agent-connect.sn",
  },
};
