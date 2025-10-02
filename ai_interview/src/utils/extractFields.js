// src/utils/extractFields.js

export function extractFieldsFromText(text) {
  if (!text) return { name: '', email: '', phone: '' };

  // email
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const email = emailMatch ? emailMatch[0] : '';

  // phone: allow +, spaces, dashes, parentheses - crude but practical
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?(\d{6,12})/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // name heuristic:
  // - split into lines
  // - ignore lines that contain email or phone
  // - choose first line in top 5 lines that looks like a name (2 capitalized words)
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let name = '';
  for (let i = 0; i < Math.min(7, lines.length); i++) {
    const ln = lines[i];
    if (email && ln.includes(email)) continue;
    if (phone && ln.includes(phone)) continue;
    // Good candidate: 2+ words, most start with capital letter
    const words = ln.split(/\s+/);
    if (words.length >= 2) {
      const capCount = words.filter(w => /^[A-Z][a-z]+$/.test(w)).length;
      if (capCount >= Math.min(2, words.length)) { name = ln; break; }
    }
  }

  return { name, email, phone };
}
