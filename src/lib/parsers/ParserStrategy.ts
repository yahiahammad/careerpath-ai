export interface IResumeParser {
    /**
     * Parse the given file buffer and return the extracted text.
     * @param buffer The file buffer to parse
     * @returns A promise resolving to the extracted text string
     */
    parse(buffer: Buffer): Promise<string>;
}
