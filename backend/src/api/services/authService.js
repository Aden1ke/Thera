import UserModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import { hashPassword, validatePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";

const userModel = new UserModel();


class AuthService {
    constructor() {
        this.model = UserModel;
    }

    // Create a new user
    async createUser(userData) {
        const existingUser = await this.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        userData.password = await hashPassword(userData.password);
        userData.displayName = userData.fullName || userData.displayName;

        let newUser;
        try {
            newUser = await userModel.create(userData);
        } catch (error) {
            throw new Error(error.message);
        }

        if (!newUser) {
            throw new Error('Failed to create user');
        }

        const token = generateToken(newUser._id, newUser.email);
        if (!token) {
            throw new Error('Failed to generate token');
        }
        
        return { user: newUser, token };
    }


    async getUserByEmail(email) {
        const user = await userModel.getUserByEmail(email)
        return user
    }

    async loginUser(email, password) {
        const user = await this.getUserByEmail(email);
        if (!user) {
          return { user: null, token: null };
        }

        // Validate password
        const isMatch = await validatePassword(password, user.password);
        if (!isMatch) {
            return { user: null, token: null };
        }

        const token = generateToken(user) // Generate JWT token 
        return {user, token };
    }
}

export default new AuthService();
export { userModel };