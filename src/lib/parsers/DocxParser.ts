import { IResumeParser } from "./ParserStrategy";
import mammoth from "mammoth";

export class DocxParser implements IResumeParser {
    async parse(buffer: Buffer): Promise<string> {
        try {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } catch (error) {
            console.error("DOCX Parser Error:", error);
            throw new Error("Failed to parse DOCX file");
        }
    }
}
