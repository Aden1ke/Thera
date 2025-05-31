import BaseModel from './baseModel.js';
import mongoose from 'mongoose';

const emergencyContactSchemaDefinition = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        default: '',
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    relationship: {
        type: String,
        trim: true,
        default: '',
    },
};

class EmergencyContactModel extends BaseModel {
    constructor() {
        super('emergencyContact', emergencyContactSchemaDefinition);
    }
}

export default EmergencyContactModel;