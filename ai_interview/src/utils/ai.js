// src/utils/ai.js

import { pipeline } from '@xenova/transformers';

// This is a "singleton" pattern. It ensures we only load the AI model once.
class AIProcessor {
    static instance = null;
    static task = 'text2text-generation';
    static model = 'Xenova/LaMini-Flan-T5-77M';

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

/**
 * Extracts a JSON object from a string, even if it's messy.
 * @param {string} str The string to search within.
 * @returns {object | null} The parsed JSON object or null if not found.
 */
function extractJSON(str) {
    // This regex finds the first occurrence of a string that starts with { and ends with }
    const match = str.match(/\{.*\}/s);
    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
            return null;
        }
    }
    return null;
}

/**
 * Evaluates a single answer against a question using the local model.
 * @returns {Promise<{score: number, feedback: string}>}
 */
export async function evaluateAnswer(question, answer) {
    const generator = await AIProcessor.getInstance();
    const prompt = `
        You are an interview evaluator. Your task is to score an answer and provide feedback.
        The question was: "${question}"
        The candidate's answer was: "${answer}"
        
        Instructions:
        1. Score the answer from 0 to 10.
        2. Provide one sentence of feedback.
        3. Return ONLY a valid JSON object in the format: {"score": <score_number>, "feedback": "..."}

        JSON response:
    `;

    const result = await generator(prompt, {
        max_new_tokens: 100,
        temperature: 0.5,
    });

    const generatedText = result[0].generated_text;
    const parsedJson = extractJSON(generatedText);

    if (parsedJson) {
        return parsedJson;
    }

    // Provide a fallback response if parsing fails
    console.error("Could not find valid JSON in the AI response:", generatedText);
    return { score: 5, feedback: "Could not automatically evaluate the answer." };
}

/**
 * Generates a final summary and overall score using the local model.
 * @returns {Promise<{finalScore: number, summary: string}>}
 */
export async function generateFinalSummary(interviewLog) {
    const generator = await AIProcessor.getInstance();
    const formattedLog = JSON.stringify(interviewLog.map(item => ({...item, answer: item.answer.substring(0, 150)})), null, 2);

    const prompt = `
        You are a hiring manager. Your task is to provide a final score and summary for an interview.
        The interview log is: ${formattedLog}
        
        Instructions:
        1. Calculate a final score out of 100 (average the individual scores and multiply by 10).
        2. Write a 2-3 sentence professional summary of the candidate's performance.
        3. Return ONLY a valid JSON object in the format: {"finalScore": <score_number>, "summary": "..."}

        JSON response:
    `;

    const result = await generator(prompt, {
        max_new_tokens: 200,
        temperature: 0.7,
    });

    const generatedText = result[0].generated_text;
    const parsedJson = extractJSON(generatedText);

    if (parsedJson) {
        return parsedJson;
    }
    
    // Provide a fallback response if parsing fails
    console.error("Could not find valid JSON in the AI summary response:", generatedText);
    return { finalScore: 50, summary: "Could not automatically generate a summary for the interview." };
}