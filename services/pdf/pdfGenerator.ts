// services/pdf/pdfGenerator.ts
import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";

export class PDFGenerator {
  static async generateFromHTML(elementId: string, filename: string = "document.pdf") {
    const element = document.getElementById(elementId);
    if (!element) return;

    await PDFGenerator.generateText(element.innerText, filename);
  }

  static async generateText(text: string, filename: string = "document.pdf") {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    let page = pdf.addPage([595.28, 841.89]);
    const { height } = page.getSize();
    const fontSize = 12;
    const margin = 48;
    const maxWidth = 595.28 - margin * 2;
    const lineHeight = fontSize * 1.4;
    const lines = PDFGenerator.wrapText(PDFGenerator.normalizeText(text), font, fontSize, maxWidth);

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
