import UserModel from "../models/userModel.js";
import APIResponse from "../utils/APIResponse.js";

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        APIResponse.success({ res, data: users });
    } catch (err) {
        APIResponse.error({ res, message: err.message });
    }
};

class UserController {
    constructor() {
        this.userModel = UserModel;
    }

    // Get a single user by ID
    async getUserById(req, res) {
        try {
            const user = await this.userModel.getUserById(req.params.id);
            if (!user) return APIResponse.notFound({ res, message: 'User not found' });
            APIResponse.success({ res, data: user });
        } catch (err) {
            APIResponse.error({ res, message: err.message });
        }
    }

    // Create a new user
    async createUser(req, res) {
        const user = new this.userModel(req.body);
        try {
            const newUser = await user.save();
            APIResponse.created({ res, data: newUser });
        } catch (err) {
            APIResponse.error({ res, message: err.message });
        }
    }   

// Update a user
async updateUser(req, res) {
    try {
        const updatedUser = await this.userModel.updateUser(req.params.id, req.body);
        if (!updatedUser) return APIResponse.notFound({ res, message: 'User not found' });
        APIResponse.success({ res, data: updatedUser });
    } catch (err) {
        APIResponse.error({ res, message: err.message });
    }
};

// Delete a user
async deleteUser(req, res) {
    try {
        const deletedUser = await this.userModel.deleteUser(req.params.id);
        if (!deletedUser) return APIResponse.notFound({ res, message: 'User not found' });
        APIResponse.success({ res, message: 'User deleted successfully' });
    } catch (err) {
        APIResponse.error({ res, message: err.message });
    }
}   
}
export default new UserController();