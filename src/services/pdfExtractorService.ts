import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;

export interface ExtractedDocumentPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocumentResult {
  fileName: string;
  totalPages: number;
  fullText: string;
  pages: ExtractedDocumentPage[];
}

export class PdfExtractorService {
  /**
   * Extracts text and page content from base64 data URL or raw buffer
   */
  public async extractPdf(dataUrlOrBase64: string, fileName: string = 'document.pdf'): Promise<ExtractedDocumentResult> {
    try {
      const base64Data = dataUrlOrBase64.includes('base64,')
        ? dataUrlOrBase64.split('base64,')[1]
        : dataUrlOrBase64;

      const buffer = Buffer.from(base64Data, 'base64');
      const data = await pdfParse(buffer);

      const rawText = data.text || '';
      // Approximate pages by form-feed characters or chunking
      const pageChunks: string[] = rawText.split('\f').filter((t: string) => t.trim().length > 0);
      const totalPages = Math.max(data.numpages || 1, pageChunks.length || 1);

      const pages: ExtractedDocumentPage[] = (pageChunks.length > 0 ? pageChunks : [rawText]).map((text: string, idx: number) => ({
        pageNumber: idx + 1,
        text: text.trim()
      }));

      return {
        fileName,
        totalPages,
        fullText: rawText.trim(),
        pages
      };
    } catch (err: any) {
      console.warn('PDF parsing error, falling back to plaintext representation:', err);
      return {
        fileName,
        totalPages: 1,
        fullText: `[PDF Document: ${fileName} uploaded by student]`,
        pages: [{ pageNumber: 1, text: `[PDF Document: ${fileName} uploaded by student]` }]
      };
    }
  }
}

export const pdfExtractorService = new PdfExtractorService();
