type TemplateRequest = {
  reference: string;
  type: string;
  subject: string;
  description: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string | null;
  commune?: string | null;
  price?: number;
  attachmentExtractedText?: string | null;
  extractedInfo?: string | null;
  createdAt?: Date | string;
};

export function extractAttachmentText(data?: string | null, mimeType?: string | null, fileName?: string | null) {
  if (!data) return "";
  const isText = mimeType?.startsWith("text/") || fileName?.toLowerCase().endsWith(".txt") || fileName?.toLowerCase().endsWith(".csv");
  if (!isText || !data.includes(",")) return "";

  try {
    const base64 = data.split(",")[1] || "";
    return Buffer.from(base64, "base64").toString("utf8").slice(0, 4000);
  } catch {
    return "";
  }
}

export function buildExtractedInfo(text: string) {
  if (!text.trim()) return "";
  const usefulLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /nom|prenom|prénom|date|lieu|registre|adresse|telephone|téléphone|commune/i.test(line))
    .slice(0, 12);
  return usefulLines.join("\n");
}

export function renderRequestTemplate(template: string | null | undefined, request: TemplateRequest) {
  const createdAt = request.createdAt ? new Date(request.createdAt).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR");
  const fallback = `Document administratif

Référence : {{reference}}
Type : {{type}}
Objet : {{subject}}
Citoyen : {{citizenName}}
Email : {{citizenEmail}}
Téléphone : {{citizenPhone}}
Commune : {{commune}}
Date : {{date}}

Informations complémentaires :
{{extractedInfo}}

Décision / observations :
`;
  const source = template?.trim() || fallback;
  const values: Record<string, string> = {
    reference: request.reference,
    type: request.type,
    subject: request.subject,
    description: request.description,
    citizenName: request.citizenName,
    citizenEmail: request.citizenEmail,
    citizenPhone: request.citizenPhone || "",
    commune: request.commune || "",
    price: `${request.price || 0}`,
    date: createdAt,
    attachmentExtractedText: request.attachmentExtractedText || "",
    extractedInfo: request.extractedInfo || "",
  };

  return source.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}
