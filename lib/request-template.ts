import { inflateRawSync } from "node:zlib";

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

const DOCX_MIME = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function dataUrlToBuffer(dataUrl: string) {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) return null;

  const metadata = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);

  try {
    return metadata.includes(";base64") ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload), "utf8");
  } catch {
    return null;
  }
}

function readZipEntry(zipBuffer: Buffer, entryName: string) {
  const minEocdSize = 22;
  const maxCommentSize = 65535;
  const eocdStart = Math.max(0, zipBuffer.length - minEocdSize - maxCommentSize);

  for (let offset = zipBuffer.length - minEocdSize; offset >= eocdStart; offset -= 1) {
    if (zipBuffer.readUInt32LE(offset) !== 0x06054b50) continue;

    const centralDirectorySize = zipBuffer.readUInt32LE(offset + 12);
    const centralDirectoryOffset = zipBuffer.readUInt32LE(offset + 16);
    let cursor = centralDirectoryOffset;
    const end = centralDirectoryOffset + centralDirectorySize;

    while (cursor < end && zipBuffer.readUInt32LE(cursor) === 0x02014b50) {
      const method = zipBuffer.readUInt16LE(cursor + 10);
      const compressedSize = zipBuffer.readUInt32LE(cursor + 20);
      const fileNameLength = zipBuffer.readUInt16LE(cursor + 28);
      const extraLength = zipBuffer.readUInt16LE(cursor + 30);
      const commentLength = zipBuffer.readUInt16LE(cursor + 32);
      const localHeaderOffset = zipBuffer.readUInt32LE(cursor + 42);
      const nameStart = cursor + 46;
      const name = zipBuffer.subarray(nameStart, nameStart + fileNameLength).toString("utf8");

      if (name === entryName) {
        const localFileNameLength = zipBuffer.readUInt16LE(localHeaderOffset + 26);
        const localExtraLength = zipBuffer.readUInt16LE(localHeaderOffset + 28);
        const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
        const compressed = zipBuffer.subarray(dataStart, dataStart + compressedSize);

        if (method === 0) return compressed;
        if (method === 8) return inflateRawSync(compressed);
        return null;
      }

      cursor += 46 + fileNameLength + extraLength + commentLength;
    }
    break;
  }

  return null;
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

function wordXmlToText(xml: string) {
  return decodeXmlEntities(
    xml
      .replace(/<w:tab\b[^>]*\/>/g, "\t")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function docxDataUrlToText(dataUrl: string) {
  const buffer = dataUrlToBuffer(dataUrl);
  if (!buffer) return "";

  try {
    const documentXml = readZipEntry(buffer, "word/document.xml");
    return documentXml ? wordXmlToText(documentXml.toString("utf8")) : "";
  } catch {
    return "";
  }
}

function textDataUrlToText(dataUrl: string) {
  const buffer = dataUrlToBuffer(dataUrl);
  return buffer ? buffer.toString("utf8") : "";
}

function normalizeTemplateSource(template: string | null | undefined, fallback: string) {
  const source = template?.trim();
  if (!source) return fallback;

  if (source.startsWith(DOCX_MIME)) {
    return docxDataUrlToText(source) || fallback;
  }

  if (source.startsWith("data:text/")) {
    return textDataUrlToText(source) || fallback;
  }

  if (source.startsWith("data:")) {
    return fallback;
  }

  return source;
}

export function extractAttachmentText(data?: string | null, mimeType?: string | null, fileName?: string | null) {
  if (!data) return "";
  const isText = mimeType?.startsWith("text/") || fileName?.toLowerCase().endsWith(".txt") || fileName?.toLowerCase().endsWith(".csv");
  if (!isText || !data.includes(",")) return "";

  try {
    const buffer = dataUrlToBuffer(data);
    return buffer ? buffer.toString("utf8").slice(0, 4000) : "";
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
  const source = normalizeTemplateSource(template, fallback);
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
