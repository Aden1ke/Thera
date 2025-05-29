import JournalService from '../services/journalService.js';
import APIResponse from '../utils/APIResponse.js';

class JournalController {
  static async getJournalsByUser(req, res) {
    const userId = req.user.id;

    try {
      const journals = await JournalService.getJournalsByUser(userId);
      return APIResponse.success(res, journals, 'Fetched journals successfully.');
    } catch (error) {
      console.error('Error fetching journals:', error);
      return APIResponse.error(res, 'Failed to fetch journals.', 500, error.message);
    }
  }

  static async getJournalById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || !userId) {
      return APIResponse.error(res, 'Journal ID and user ID are required.', 400);
    }

    try {
      const journal = await JournalService.getJournalById(id, userId);
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

export default JournalController;
