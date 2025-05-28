import JournalService from '../services/journalService.js';
import APIResponse from '../utils/APIResponse.js';

class JournalController {
  async createJournalEntry(req, res) {
    const { text } = req.body;
    const userId = req.userId;
   
    if (!text || !userId) {
      return APIResponse.error(res, 'Text and userId required.', 400);
    }

    try {
      const journal = await JournalService.createJournal({ userId, text });
      return APIResponse.created(res, 'Journal entry created successfully', journal);
    } catch (error) {
      console.error('Journal creation failed:', error.message);
      return APIResponse.error(res, 'Internal server error.');
    }
  }

  async getEmotionLog(req, res) {
    const userId = req.userId;
    const { from, to, emotion } = req.query;

    try {
      const logs = await JournalService.getEmotionLogs({ userId, from, to, emotion });
      return APIResponse.success(res, logs, 'Fetched emotion log successfully.');
    } catch (error) {
      console.error('Error fetching logs:', error.message);
      return APIResponse.error(res, 'Failed to fetch emotion log.');
    }
  }

  async getJournalsByUser(req, res) {
    const userId = req.userId;

    try {
      const journals = await JournalService.getJournalsByUser(userId);
      return APIResponse.success(res, journals, 'Fetched journals successfully.');
    } catch (error) {
      console.error('Error fetching journals:', error.message);
      return APIResponse.error(res, 'Failed to fetch journals.');
    }
  }

  async getJournalById(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    if (!id || !userId) {
      return APIResponse.error(res, 'Journal ID and user ID are required.', 400);
    }

    try {
      const journal = await this.getJournalById(id, userId);
      if (!journal) {
        return APIResponse.notFound(res, 'Journal entry not found.');
      }
      return APIResponse.success(res, journal, 'Fetched journal entry successfully.');
    } catch (error) {
      console.error('Error fetching journal by ID:', error.message);
      return APIResponse.error(res, 'Failed to fetch journal entry.');
    }
  }
}

export default new JournalController();
