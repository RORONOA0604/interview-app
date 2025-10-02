import pdf from "pdf-parse";
// import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import pkg from "google-libphonenumber";

const { PhoneNumberUtil, PhoneNumberFormat } = pkg;

const phoneUtil = PhoneNumberUtil.getInstance();

function extractName(text) {
  const lines = text.split("\n").slice(0, 10);
  const indicators = ["summary", "objective", "experience", "education", "skills", "projects", "contact"];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const isTitleCase = words.every(
        (w) => /^[A-Z][a-z]+$/.test(w) || /^[A-Z]\.$/.test(w)
      );
      if (isTitleCase && !indicators.some((i) => line.toLowerCase().includes(i))) {
        return line;
      }
    }
  }
  return null;
}

function extractEmail(text) {
  const match = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  return match ? match[0] : null;
}

function extractPhone(text) {
  try {
    const match = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
    if (match) {
      const number = phoneUtil.parseAndKeepRawInput(match[0], "US");
      return phoneUtil.format(number, PhoneNumberFormat.E164);
    }
  } catch (e) {
    console.error("Phone parse error:", e);
  }
  return null;
}

export async function parseResume(buffer) {
  try {
    const data = await pdf(buffer);
    const text = data.text;

    if (!text) {
      return { error: "Could not extract text from PDF" };
    }

    const name = extractName(text);
    const email = extractEmail(text);
    const phone = extractPhone(text);

    return { name, email, phone };
  } catch (e) {
    console.error("Parse error:", e);
    return { error: "Failed to parse PDF" };
  }
}
