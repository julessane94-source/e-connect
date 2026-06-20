// services/upload/uploadService.ts
import axios from "axios";

export class UploadService {
  static async uploadFile(file: File, path: string = "documents"): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.url;
    } catch (error) {
      console.error("Erreur upload:", error);
      throw error;
    }
  }

  static async uploadMultiple(files: File[], path: string = "documents"): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.uploadFile(file, path);
      urls.push(url);
    }
    return urls;
  }
}
