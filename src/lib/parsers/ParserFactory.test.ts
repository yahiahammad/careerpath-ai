import { describe, it, expect } from 'vitest';
import { ParserFactory } from './ParserFactory';
import { PdfParser } from './PdfParser';
import { DocxParser } from './DocxParser';

describe('ParserFactory', () => {
    it('should return a PdfParser for application/pdf', () => {
        const parser = ParserFactory.getParser('application/pdf', 'resume.pdf');
        expect(parser).toBeInstanceOf(PdfParser);
    });

    it('should return a DocxParser for application/vnd.openxmlformats-officedocument.wordprocessingml.document', () => {
        const parser = ParserFactory.getParser('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'resume.docx');
        expect(parser).toBeInstanceOf(DocxParser);
    });

    it('should return a DocxParser for .docx extension', () => {
        const parser = ParserFactory.getParser('application/octet-stream', 'resume.docx');
        expect(parser).toBeInstanceOf(DocxParser);
    });

    it('should throw an error for unsupported file types', () => {
        expect(() => {
            ParserFactory.getParser('image/jpeg', 'photo.jpg');
        }).toThrow('Unsupported file format: image/jpeg');
    });
});
