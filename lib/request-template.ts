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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderWordRun(runXml: string, imageSources: Map<string, string>) {
  const properties = runXml.match(/<w:rPr\b[\s\S]*?<\/w:rPr>/)?.[0] || "";
  let content = runXml
    .replace(/<w:tab\b[^>]*\/>/g, "&nbsp;&nbsp;&nbsp;")
    .replace(/<w:br\b[^>]*\/>/g, "\uE000")
    .replace(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g, (_, text: string) => escapeHtml(decodeXmlEntities(text)))
    .replace(/<[^>]+>/g, "")
    .replace(/\uE000/g, "<br>");
  const embeddedImages = Array.from(runXml.matchAll(/<a:blip\b[^>]*r:embed="([^"]+)"/g), (match) => {
    const dataUrl = imageSources.get(match[1]);
    if (!dataUrl) return "";
    const description = runXml.match(/<wp:docPr\b[^>]*descr="([^"]+)"/)?.[1] || "Image du modèle";
    return '<img src="' + dataUrl + '" alt="' + escapeHtml(decodeXmlEntities(description)) + '">';
  }).join("");
  content += embeddedImages;
  if (!content) return "";

  const color = properties.match(/<w:color\b[^>]*w:val="([0-9a-f]{6})"/i)?.[1];
  const halfPoints = Number(properties.match(/<w:sz\b[^>]*w:val="(\d+)"/i)?.[1] || 0);
  const fontName = properties.match(/<w:rFonts\b[^>]*w:ascii="([^"]+)"/i)?.[1] || "";
  const allowedFonts = ["Arial", "Calibri", "Georgia", "Times New Roman", "Verdana", "Tahoma", "Courier New"];
  const safeFont = allowedFonts.find((font) => font.toLowerCase() === fontName.toLowerCase());
  if (color || (halfPoints >= 12 && halfPoints <= 96) || safeFont) {
    const styles = [color ? "color:#" + color : "", halfPoints ? "font-size:" + halfPoints / 2 + "pt" : "", safeFont ? "font-family:" + safeFont : ""].filter(Boolean);
    content = "<span style=\"" + styles.join(";") + "\">" + content + "</span>";
  }
  if (/<w:u\b(?![^>]*w:val="none")[^>]*\/>/i.test(properties)) content = "<u>" + content + "</u>";
  if (/<w:i\b(?![^>]*w:val="0")[^>]*\/>/i.test(properties)) content = "<em>" + content + "</em>";
  if (/<w:b\b(?![^>]*w:val="0")[^>]*\/>/i.test(properties)) content = "<strong>" + content + "</strong>";
  return content;
}

function renderWordParagraph(xml: string, imageSources: Map<string, string>) {
  const properties = xml.match(/<w:pPr\b[\s\S]*?<\/w:pPr>/)?.[0] || "";
  const heading = properties.match(/<w:pStyle\b[^>]*w:val="Heading([1-3])"/i)?.[1];
  const tag = heading ? "h" + heading : "p";
  const alignmentValue = properties.match(/<w:jc\b[^>]*w:val="(left|center|right|both)"/i)?.[1];
  const alignment = alignmentValue === "both" ? "justify" : alignmentValue;
  const runs = Array.from(xml.matchAll(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g), (match) => renderWordRun(match[0], imageSources)).join("");
  return "<" + tag + (alignment ? ' style="text-align:' + alignment + '"' : "") + ">" + (runs || "<br>") + "</" + tag + ">";
}

function renderWordTable(xml: string, imageSources: Map<string, string>) {
  const rows = Array.from(xml.matchAll(/<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g), (row) => {
    const cells = Array.from(row[1].matchAll(/<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g), (cell) => {
      const content = renderWordBlocks(cell[1], imageSources);
      return "<td>" + (content || "<p><br></p>") + "</td>";
    }).join("");
    return "<tr>" + cells + "</tr>";
  }).join("");
  return rows ? "<table><tbody>" + rows + "</tbody></table>" : "";
}

function renderWordBlocks(xml: string, imageSources: Map<string, string>) {
  return Array.from(xml.matchAll(/<w:p\b[^>]*>[\s\S]*?<\/w:p>|<w:tbl\b[^>]*>[\s\S]*?<\/w:tbl>/g), (block) =>
    block[0].startsWith("<w:tbl") ? renderWordTable(block[0], imageSources) : renderWordParagraph(block[0], imageSources)
  ).join("");
}

function wordXmlToHtml(xml: string, imageSources: Map<string, string>) {
  const body = xml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)?.[1] || xml;
  return renderWordBlocks(body, imageSources);
}

function docxDataUrlToText(dataUrl: string) {
  const buffer = dataUrlToBuffer(dataUrl);
  if (!buffer) return "";

  try {
    const documentXml = readZipEntry(buffer, "word/document.xml");
    if (!documentXml) return "";
    const relationshipsXml = readZipEntry(buffer, "word/_rels/document.xml.rels")?.toString("utf8") || "";
    const imageSources = new Map<string, string>();
    for (const match of relationshipsXml.matchAll(/<Relationship\b([^>]*)\\/>/g)) {
      const attributes = match[1];
      const id = attributes.match(/\bId="([^"]+)"/)?.[1];
      const target = attributes.match(/\bTarget="([^"]+)"/)?.[1];
      const external = /\bTargetMode="External"/i.test(attributes);
      if (!id || !target || external || target.includes("..")) continue;
      const entryName = target.startsWith("/") ? target.slice(1) : target.startsWith("word/") ? target : "word/" + target;
      const extension = entryName.split(".").pop()?.toLowerCase();
      const mimeType = extension === "png" ? "image/png"
        : extension === "jpg" || extension === "jpeg" ? "image/jpeg"
          : extension === "gif" ? "image/gif"
            : extension === "webp" ? "image/webp" : "";
      const image = mimeType ? readZipEntry(buffer, entryName) : null;
      if (image) imageSources.set(id, "data:" + mimeType + ";base64," + image.toString("base64"));
    }
    return wordXmlToHtml(documentXml.toString("utf8"), imageSources);
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

  const isHtml = /<\/?(?:p|div|table|h[1-3]|strong|em|u)\b/i.test(source);
  return source.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = values[key] ?? "";
    return isHtml ? escapeHtml(value) : value;
  });
}
