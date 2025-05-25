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
    passwordHash: {
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
}

export default new UserModel();

  