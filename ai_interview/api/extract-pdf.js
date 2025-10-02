import formidable from "formidable";
import fs from "fs";
import { parseResume } from "../utils/parser.js";

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

    const resumeFile = files.resume;
    if (!resumeFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (resumeFile.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Invalid file type. Please upload a PDF." });
    }

    try {
      const buffer = fs.readFileSync(resumeFile.filepath);
      const result = await parseResume(buffer);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }
      res.status(200).json(result);
    } catch (e) {
      console.error("PDF parse error:", e);
      res.status(500).json({ error: "Failed to process the PDF" });
    }
  });
}
