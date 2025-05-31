import UserModel from "../models/user.js";
import jwt from 'jsonwebtoken';
import { hashPassword, validatePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import EmergencyContactModel from "../models/emergencyContactModel.js";
import mongoose from 'mongoose';


const userModel = new UserModel();


class AuthService {
    constructor() {
        this.model = UserModel;
        this.emergencyContactModel = new EmergencyContactModel  
    }

    // Create a new user
    async createUser(userData) {
        const existingUser = await this.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        userData.password = await hashPassword(userData.password);
        userData.displayName = userData.fullName || userData.displayName;

        const { emergencyContact, ...userFields } = userData;

        let newUser;
        try {
            newUser = await userModel.create(userFields);
        } catch (error) {
            throw new Error(error.message);
        }

        if (!newUser) {
            throw new Error('Failed to create user');
        }

        let emergencyContactDoc = null;
        if (emergencyContact) {
            emergencyContactDoc = await this.emergencyContactModel.create({
                ...emergencyContact,
                userId: newUser._id
            });
        }

        const userObj = newUser.toObject ? newUser.toObject() : newUser;
        userObj.emergencyContact = emergencyContactDoc || {
            name: "",
            email: "",
            phone: "",
            relationship: ""
        };

        const token = generateToken(newUser._id, newUser.email);
        if (!token) {
            throw new Error('Failed to generate token');
        }
        
        return { user: userObj, token };
    }


    async getUserByEmail(email) {
        const user = await userModel.getUserByEmail(email)
        if (!user) return null;

        const userIdObj = typeof user._id === "string" ? new mongoose.Types.ObjectId(user._id) : user._id;
        const emergencyContact = await this.emergencyContactModel.findOne({ userId: userIdObj });
        const userObj = user.toObject ? user.toObject() : user;
        console.log(userObj);
        return { ...userObj, emergencyContact };
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

        console.log('User found:', user);

        const token = generateToken(user) // Generate JWT token 
        return {user, token };
    }

    async getUserById(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const userIdObj = typeof user._id === "string" ? new mongoose.Types.ObjectId(user._id) : user._id;
        const emergencyContact = await this.emergencyContactModel.model.findOne({ userId: userIdObj });
        const userObj = user.toObject ? user.toObject() : user;
        userObj.emergencyContact = emergencyContact || {
            name: "",
            email: "",
            phone: "",
            relationship: ""
        };

        return userObj;
    }

    async updateUserById(userId, updateData) {
    try {
        const { emergencyContact, ...userFields } = updateData;

        // Update user fields
        const updatedUser = await userModel.model.findByIdAndUpdate(userId, userFields, { new: true });
        if (!updatedUser) throw new Error('User not found');

        // Update or create emergency contact
        let updatedEmergencyContact = null;
        if (emergencyContact) {
            const userIdObj = new mongoose.Types.ObjectId(userId);
            updatedEmergencyContact = await this.emergencyContactModel.findOneAndUpdate(
                { userId: userIdObj },
                { $set: { ...emergencyContact, userId: userIdObj } },
                { upsert: true, new: true, strict: false }
            );
        } else {
            updatedEmergencyContact = await this.emergencyContactModel.findOne({ userId });
        }

        const userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
        userObj.emergencyContact = updatedEmergencyContact || {
            name: "",
            email: "",
            phone: "",
            relationship: ""
        };

        console.log('Updated user:', userObj);

        return userObj;
    } catch (error) {
        console.error('Error in updateUserById:', error);
        throw new Error('Failed to save profile.');
    }
}
}

export default new AuthService();
export { userModel };