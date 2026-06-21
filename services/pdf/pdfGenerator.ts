// services/pdf/pdfGenerator.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export class PDFGenerator {
  static async generateFromHTML(elementId: string, filename: string = "document.pdf") {
    const element = document.getElementById(elementId);
    if (!element) return;

    await PDFGenerator.generateText(element.innerText, filename);
  }

  static async generateText(text: string, filename: string = "document.pdf") {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const page = pdf.addPage([595.28, 841.89]);
    const { height } = page.getSize();
    const fontSize = 12;
    const margin = 48;
    const maxWidth = 595.28 - margin * 2;
    const lineHeight = fontSize * 1.4;
    const lines = PDFGenerator.wrapText(text, font, fontSize, maxWidth);

    let y = height - margin;
    for (const line of lines) {
      if (y < margin) break;
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
    link.click();
    URL.revokeObjectURL(url);
  }

  private static wrapText(
    text: string,
    font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
    fontSize: number,
    maxWidth: number
  ) {
    return text.split(/\r?\n/).flatMap((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
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
