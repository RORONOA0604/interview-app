// src/utils/parseResume.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import mammoth from 'mammoth';

export async function parseFileToText(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return await parsePdf(file);
  } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
    return await parseDocx(file);
  } else {
    throw new Error('Unsupported file type. Use PDF or DOCX.');
  }
}

async function parsePdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  // pdfjs-dist usage
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((it) => it.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

async function parseDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  // mammoth.extractRawText returns {value, messages}
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value; // plain text
}
