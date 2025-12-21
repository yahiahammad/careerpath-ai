import { IResumeParser } from "./ParserStrategy";

export class PdfParser implements IResumeParser {
    async parse(buffer: Buffer): Promise<string> {
        const JSONTransport = require("pdf2json/pdfparser");

        return new Promise((resolve, reject) => {
            const pdfParser = new JSONTransport(null, 1);

            pdfParser.on("pdfParser_dataError", (errData: any) => {
                console.error("PDF Parser Error:", errData);
                reject(new Error("Failed to parse PDF"));
            });

            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                try {
                    // Extract text from the structured JSON
                    const textContent = pdfData.Pages.map((page: any) =>
                        page.Texts.map((text: any) =>
                            decodeURIComponent(text.R[0].T)
                        ).join(" ")
                    ).join("\n");

                    resolve(textContent);
                } catch (e) {
                    reject(new Error("Failed to extract text from PDF data"));
                }
            });

            pdfParser.parseBuffer(buffer);
        });
    }
}
