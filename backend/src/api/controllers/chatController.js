import chatService from '../langchain/chat.js'

class ChatController {
    static async chatWithUser(req, res) {
        try {
        const { entry, emotion, distress } = req.body;
        const reply = await chatService.chatWithUser(entry, emotion, distress);
        res.json({ reply });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
}

export default ChatController;