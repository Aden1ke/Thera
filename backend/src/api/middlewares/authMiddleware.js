import jwt from 'jsonwebtoken';
import APIResponse from '../utils/APIResponse.js';

class AuthMiddleware {
  handle(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.error(res, 'Authorization token missing', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}

export default new AuthMiddleware();
