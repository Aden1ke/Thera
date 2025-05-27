import BaseModel from './baseModel.js';


const userSchemaDefinition = {
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    middleName: {
          type: String,
        trim: true,
        default: '',
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    displayName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePictureUrl: {
        type: String,
        default: '',
    },
};

class UserModel extends BaseModel {
    constructor() {
        super('user', userSchemaDefinition);
    }

    async getUserByEmail(email) {
        return await this.model.findOne({ email });
    }
    async getUserById(userId) {
        return await this.model.findById(userId);   
    }
    async createUser(userData) {
        const user = new this.model(userData);
        return await user.save();
    }
    async updateUser(userId, updateData) {
        return await this.model.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true } 
        );
    }
    async deleteUser(userId) {
        return await this.model.findByIdAndDelete(userId);
    }   
}

export default UserModel;