// services/qrcode/qrGenerator.ts
import QRCode from "qrcode";

export class QRGenerator {
  static async generate(data: string, options?: any): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        width: options?.width || 200,
        margin: options?.margin || 2,
        color: {
          dark: options?.color || "#000000",
          light: "#ffffff",
        },
      });
    } catch (err) {
      console.error("Erreur génération QR:", err);
      throw err;
    }
  }

  static async generateToCanvas(data: string, canvas: HTMLCanvasElement, options?: any) {
    try {
      await QRCode.toCanvas(canvas, data, {
        width: options?.width || 200,
        margin: options?.margin || 2,
        color: {
          dark: options?.color || "#000000",
          light: "#ffffff",
        },
      });
    } catch (err) {
      console.error("Erreur génération QR:", err);
      throw err;
    }
  }
}
