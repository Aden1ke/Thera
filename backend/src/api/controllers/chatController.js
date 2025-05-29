import chatService from '../langchain/chat.js'
import journalService from '../services/journalService.js';
import APIResponse from '../utils/APIResponse.js';
import { getEntryVectorStore } from '../utils/vectorStore.js';

class ChatController {
    static async chatWithUser(req, res) {
        const userId = req.user.id;
        console.log('User ID:', userId);
        try {
            const { text } = req.body;
            let journalEntry;

            try {
                journalEntry = await journalService.createJournal({ userId, text });
            } catch (error) {
                console.log(error);
                return APIResponse.error(res, 'Error registering user', 400, error.message);
            }

            const { entry, emotions, distressScore } = journalEntry;

            const context = {
                userId,
                entry,
                emotions,
                distressScore
            };

            let reply;
            try {
                reply = await chatService.chatWithUser(entry, emotions, distressScore, userId);
            } catch (error) {
                console.log(error);
                return APIResponse.error(res, 'Error registering user', 400, error.message);
            }

            console.log('Total embedded entries:', getEntryVectorStore().memoryVectors.length);
            
            res.json({ reply });
        } catch (error) {
            console.error(error);
            return APIResponse.error(res, 'Something went wrong', 500, error.message);
        }
    }
}

export default ChatController;