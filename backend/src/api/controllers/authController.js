// backend/src/api/controllers/authController.js
import authService from '../services/authService.js';
import mongoose from 'mongoose'; // You might not strictly need mongoose here if authService handles all DB interaction
import APIResponse from '../utils/APIResponse.js';
import { sanitizeUserResponse } from '../utils/sanitize.js';


class AuthController {
    static async register(req, res) {
        console.log('Backend: AuthController.register called');
        console.log('Backend: Request body for register:', req.body); // Log the incoming request body

        try {
            // Validate basic required fields before calling service
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                console.log('Backend: Registration - Missing required fields (username, email, or password)');
                return APIResponse.error(res, 'Username, email, and password are required', 400);
            }

            let result;
            try {
                result = await authService.createUser(req.body);
                console.log('Backend: User created successfully by authService. User ID:', result.user ? result.user._id : 'N/A');
            } catch (error) {
                console.error('Backend: Error in authService.createUser (likely user exists or DB error):', error.message);
                // More specific error handling for user exists might be better in authService
                // Example: if (error.message.includes('duplicate key')) { return APIResponse.error(res, 'User with this email already exists', 409); }
                return APIResponse.error(res, 'Error registering user', 400, error.message);
            }

            const sanitizedUserData = sanitizeUserResponse(result.user);
            console.log('Backend: User registration successful, sending response.');

            return APIResponse.created(res, 'User registered successfully', {
                user: sanitizedUserData,
                token: result.token
            });
        } catch (error) {
            console.error('Backend: Catch-all error in AuthController.register:', error); // Log unexpected errors
            return APIResponse.error(res, 'Internal server error during registration', 500, error.message);
        }
    }

    static async login(req, res) {
        console.log('Backend: AuthController.login called');
        console.log('Backend: Request body for login:', req.body); // Log the incoming request body

        try {
            const email = req.body.email;
            const password = req.body.password;

            if (!email || !password) {
                console.log('Backend: Login - Email or password missing');
                return APIResponse.error(res, 'Email and password are required', 400);
            }

            const { user, token } = await authService.loginUser(email, password);
            console.log('Backend: authService.loginUser returned. User found:', user ? user.email : 'null');

            if (!user) {
                console.log('Backend: Login - Invalid email or password provided');
                return APIResponse.error(res, 'Invalid email or password', 401);
            }

            const sanitizedUserData = sanitizeUserResponse(user);
            console.log('Backend: User logged in successfully, sending response.');

            return APIResponse.success(res, {
                user: sanitizedUserData,
                token
            }, 'User logged in successfully');
        } catch (error) {
            console.error('Backend: Catch-all error in AuthController.login:', error); // Log unexpected errors
            return APIResponse.error(res, 'Internal server error during login', 500, error.message);
        }
    }

    static async getUser(req, res) {
        const userId = req.user.id;

        if (!userId) {
            console.log('Backend: getUser - User ID not found in request');
            return APIResponse.error(res, 'User ID is required', 400);
        }

        try {
            const user = await authService.getUserById(userId);
            if (!user) {
                console.log('Backend: getUser - User not found for ID:', userId);
                return APIResponse.notFound(res, 'User not found');
            }

            const sanitizedUserData = sanitizeUserResponse(user);
            console.log(sanitizedUserData);

            return APIResponse.success(res, { user: sanitizedUserData }, 'User data retrieved successfully');
        } catch (error) {
            console.error('Backend: Catch-all error in AuthController.getUser:', error); // Log unexpected errors
            return APIResponse.error(res, 'Internal server error while fetching user data', 500, error.message);
        }
    }

    static async updateUser(req, res) {
        const userId = req.user.id;
        if (!userId) {
            return APIResponse.error(res, 'User ID is required', 400);
        }

        try {
            const updatedUser = await authService.updateUserById(userId, req.body);
            if (!updatedUser) {
                return APIResponse.notFound(res, 'User not found');
            }

            const sanitizedUserData = sanitizeUserResponse(updatedUser);
            return APIResponse.success(res, { user: sanitizedUserData }, 'User profile updated successfully');
        } catch (error) {
            console.error('Backend: Error updating user profile:', error);
            return APIResponse.error(res, 'Failed to update user profile', 500, error.message);
        }
    } 

}

export default AuthController;
