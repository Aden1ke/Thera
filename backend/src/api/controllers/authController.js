import authService from '../services/authService.js';
import mongoose from 'mongoose';
import APIResponse from '../utils/APIResponse.js';
import { sanitizeUserResponse } from '../utils/sanitize.js';


class AuthController {
    static async register(req, res) {
        try {
            let result;
            try {
                result = await authService.createUser(req.body);
            } catch (error) {
                console.log(error);
                return APIResponse.error(res, 'Error registering user', 400, error.message);
            }

            const sanitizedUserData = sanitizeUserResponse(result.user);
            
            return APIResponse.created(res, 'User registered successfully', {
                user: sanitizedUserData,
                token: result.token
            });
        } catch (error) {
            console.log(error);
            return APIResponse.error(res, 'Internal server error during registration', 500, error.message);

        }
    }

    static async login(req, res) {
        try {
            const email = req.body.email;
            const password = req.body.password;

            if (!email || !password) {
                return APIResponse.error(res, 'Email and password are required', 400);
            }

            const { user, token } = await authService.loginUser(email, password);

            if (!user) {
                return APIResponse.error(res, 'Invalid email or password', 401);
                return;
            }

            const sanitizedUserData = sanitizeUserResponse(user);

            return APIResponse.success(res, {
                user: sanitizedUserData,
                token
            }, 'User logged in successfully');
        } catch (error) {
            console.log(error)
            return APIResponse.error(res, 'Internal server error during login', 500, error.message);
        }
    }
}

export default AuthController;