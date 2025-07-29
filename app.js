// 1. Load environment variables
import dotenv from 'dotenv';
dotenv.config();
import { writeFileSync } from 'fs';

import { GoogleGenAI } from "@google/genai";

// 2. Konfigurasi
const API_KEY = process.env.API_KEY;

/**
 * 3. Menganalisis konten log menggunakan Google GenAI.
 * @param {string} content - Konten log yang akan dianalisis.
 * @returns {Promise<string>} - Hasil analisis dari Google GenAI.
 */
async function googleGenAIExecute(content) {
    console.log('Sending content to Google GenAI for analysis...');
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: content, // Menggunakan konten yang diterima sebagai input
            config: {
                thinkingConfig: {
                    thinkingBudget: 0, // Disables thinking
                },
            }
        });
        console.log('Received response from Google GenAI.', response.text);
        return response.text; // Mengembalikan hasil analisis
    } catch (error) {
        console.error('Error analyzing log with GenAI:', error.message);
        throw new Error(`Failed to get analysis from GenAI: ${error.message}`);
    }
}

/**
 * Fungsi utama untuk menjalankan seluruh proses.
 */
async function main() {
    try {
        // 2. Analisis log dengan Google GenAI
        const analysis = await googleGenAIExecute("generate new project with nestjs and typescript, after that execute all bash commands from response");
        const response = await googleGenAIExecute('buatkan coding javascript untuk mengeksekusi response berikut:' + analysis);

        // create a new file setup.js and write the response to it
        const filePath = 'setup.js';
        writeFileSync(filePath, response, 'utf8');
    } catch (error) {
        console.error('An error occurred during the process:', error.message);
        process.exit(1); // Keluar dengan kode error
    }
}

// Jalankan fungsi utama
main();