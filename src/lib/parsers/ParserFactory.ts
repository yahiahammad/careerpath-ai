import { IResumeParser } from "./ParserStrategy";
import { PdfParser } from "./PdfParser";
import { DocxParser } from "./DocxParser";

export class ParserFactory {
    /**
     * Returns the appropriate parser based on the file MIME type.
     * Throws an error if the format is not supported.
     */
    static getParser(mimeType: string, fileName: string): IResumeParser {
        if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
            return new PdfParser();
        }

        if (
            mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            fileName.endsWith(".docx")
        ) {
            return new DocxParser();
        }

        throw new Error(`Unsupported file format: ${mimeType}`);
    }
}
