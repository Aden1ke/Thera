import UserModel from "../models/user.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  constructor() {
    this.model = UserModel;
  }

  // Create a new user (signup)
  async createUser(userData) {
    const existingUser = await this.model.findOne({ email: userData.email }); // Checks if email already exists
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    // Save user
    const newUser = new this.model(userData);
    return await newUser.save();
  }

  // Find user by email (for login)
  async findUserByEmail(email) {
    return await this.model.findOne({ email });
  }

  // Validate password during login
  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Generate JWT token
  generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      fullName: user.fullName || user.displayName,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
  }
}

export default new UserService();
