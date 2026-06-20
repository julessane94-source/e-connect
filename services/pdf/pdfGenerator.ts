// services/pdf/pdfGenerator.ts
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export class PDFGenerator {
  static async generateFromHTML(elementId: string, filename: string = "document.pdf") {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  }

  static generateText(text: string, filename: string = "document.pdf") {
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(text, 180);
    pdf.text(lines, 15, 20);
    pdf.save(filename);
  }
}
