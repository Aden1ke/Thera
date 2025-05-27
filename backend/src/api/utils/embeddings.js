import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from 'dotenv';

dotenv.config();

export const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
});