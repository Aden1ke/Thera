import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from "langchain/chains";
import { getEntryVectorStore, getVectorStore } from '../utils/vectorStore.js';
import JournalEntryModel from '../models/journal.js';

class ChatService {
    constructor() {
        this.chat = new ChatOpenAI({
            temperature: 0.7,
            modelName: 'gpt-3.5-turbo',
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        this.chatPrompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate("You are a compassionate therapist."),
            HumanMessagePromptTemplate.fromTemplate(
                `The user is feeling {emotion} and rates their distress as {distress}/10.
                They wrote: "{entry}"
                Here is some context you may use: {context}
                Make the conversation flow while and sounding human while making sure to maintain the qualities of a counsellor(A counselor does not talk too much)
                Respond with empathy.`
            ),
        ]);

        this.journalEntry = new JournalEntryModel();

        this.chain = new LLMChain({ llm: this.chat, prompt: this.chatPrompt });
    }

    async chatWithUser(entry, emotion, distress, userId) {
        let context = '';

        try {
            const entryVectorStore = getEntryVectorStore();
            const entryRetriever = entryVectorStore.asRetriever();
            const entryDocs = await entryRetriever.getRelevantDocuments(`${entry} ${emotion} distress: ${distress}`);

            const userEntryDocs = entryDocs.filter(doc => 
                doc.metadata.userId?.toString() === userId.toString()
            );

            if (userEntryDocs.length) {
                const entryContext = userEntryDocs.map(doc => doc.pageContent).join('\n---\n');
                context += "Related previous entries:\n" + entryContext;
            }

            console.log("Entry docs:", userEntryDocs);
        } catch (err) {
            console.warn('No entry context available:', err.message);
        }


        if (distress >= 8) {
            const vectorStore = getVectorStore();
            const retriever = vectorStore.asRetriever();
            const docs = await retriever.getRelevantDocuments(`${entry} ${emotion} distress: ${distress}`);
            if (docs.length) {
                const seedContext = docs.map(doc => doc.pageContent).join('\n---\n');
                context += (context ? '\n\n' : '') + "Suggested ritual(s):\n" + seedContext;
            }
        }

        const res = await this.chain.call({ entry, emotion, distress, context });
        return res.text;
    }

    async createEntry(entryData) {
        let newEntry;

        try {
          newEntry = this.journalEntry.createEntry(entryData);
        } catch (error) {
          throw new Error(error.message);
        }

        return newEntry;

    }
}

export default new ChatService();