import chatService from '../langchain/chat.js'
import { getEntryVectorStore } from '../utils/vectorStore.js';

class ChatController {
    static async chatWithUser(req, res) {
        const userId = req.user.id;
        console.log('User ID:', userId);
        try {
            const { entry, emotion, distressScore } = req.body;
            try {
                const journalEntry = await chatService.createEntry({ userId, entry, emotion, distressScore });
            } catch (error) {
                console.log(error);
                return APIResponse.error(res, 'Error registering user', 400, error.message);
            }
            
            let reply;
            try {
                reply = await chatService.chatWithUser(entry, emotion, distressScore, userId);
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