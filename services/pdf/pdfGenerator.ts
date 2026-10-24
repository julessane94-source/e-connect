// services/pdf/pdfGenerator.ts
import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";

export class PDFGenerator {
  static async generateFromHTML(elementId: string, filename: string = "document.pdf") {
    const element = document.getElementById(elementId);
    if (!element) return;

    await PDFGenerator.generateText(element.innerText, filename);
  }

  static async generateText(text: string, filename: string = "document.pdf", signatureDataUrl?: string) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    let page = pdf.addPage([595.28, 841.89]);
    const { height } = page.getSize();
    const fontSize = 12;
    const margin = 48;
    const maxWidth = 595.28 - margin * 2;
    const lineHeight = fontSize * 1.4;
    const lines = PDFGenerator.wrapText(PDFGenerator.normalizeText(PDFGenerator.htmlToText(text)), font, fontSize, maxWidth);

    let y = height - margin;
    for (const line of lines) {
      if (y < margin) {
        page = pdf.addPage([595.28, 841.89]);
        y = height - margin;
      }
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    }

    if (signatureDataUrl) {
      const match = signatureDataUrl.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/);
      if (match) {
        if (y < margin + 100) {
          page = pdf.addPage([595.28, 841.89]);
          y = height - margin;
        }
        const imageBytes = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0));
        const signature = match[1] === "png"
          ? await pdf.embedPng(imageBytes)
          : await pdf.embedJpg(imageBytes);
        const maxWidth = 150;
        const maxHeight = 54;
        const scale = Math.min(maxWidth / signature.width, maxHeight / signature.height, 1);
        const imageWidth = signature.width * scale;
        const imageHeight = signature.height * scale;
        page.drawText("Signature électronique du maire", {
          x: 595.28 - margin - maxWidth,
          y: y - 12,
          size: 9,
          font,
          color: rgb(0.25, 0.3, 0.25),
        });
        page.drawImage(signature, {
          x: 595.28 - margin - imageWidth,
          y: y - 20 - imageHeight,
          width: imageWidth,
          height: imageHeight,
        });
      }
    }

    const bytes = await pdf.save();
    const arrayBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(arrayBuffer).set(bytes);
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private static htmlToText(value: string) {
    if (!/<\/?(p|div|br|h[1-6]|ul|ol|li|blockquote|span|strong|b|em|i|u)\b/i.test(value)) return value;

    const parsed = new DOMParser().parseFromString(value, "text/html");
    const blockTags = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "blockquote", "table", "thead", "tbody", "tfoot"]);
    const readNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
      if (node.nodeType !== Node.ELEMENT_NODE) return "";

      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();
      if (tag === "br" || tag === "hr") return "\n";
      if (tag === "img") return (element as HTMLImageElement).alt || "";
      const children = Array.from(element.childNodes).map(readNode).join("");
      if (tag === "li") return "- " + children.trim() + "\n";
      if (tag === "td" || tag === "th") return children.trim() + " | ";
      if (tag === "tr") return children.trim() + "\n";
      return blockTags.has(tag) ? children.trim() + "\n\n" : children;
    };

    return Array.from(parsed.body.childNodes).map(readNode).join("").replace(/\n{3,}/g, "\n\n").trim();
  }

  private static normalizeText(text: string) {
    return text
      .replace(/\u00a0/g, " ")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, "\"")
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\u2022/g, "-")
      .replace(/\u2026/g, "...")
      .replace(/\u20ac/g, "EUR");
  }

  private static sanitizeForFont(text: string, font: PDFFont) {
    return Array.from(text).map((char) => {
      try {
        font.encodeText(char);
        return char;
      } catch {
        return "";
      }
    }).join("");
  }

  private static wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
    return text.split(/\r?\n/).flatMap((paragraph) => {
      const words = paragraph.split(/\s+/).map((word) => PDFGenerator.sanitizeForFont(word, font)).filter(Boolean);
      const lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
          currentLine = candidate;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }

      return currentLine ? [...lines, currentLine] : [""];
    });
  }
}
