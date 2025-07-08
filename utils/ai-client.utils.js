/**
 * Initializes and exports a Google Generative AI client instance using the Gemini API key from environment variables.
 *
 * Usage: Use genAI to interact with the Gemini model *
 * @module utils/ai-client
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export default genAI;
