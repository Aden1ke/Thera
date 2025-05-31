// backend/src/api/routes/userRoutes.js
import express from 'express';
// --- CHANGE THIS LINE ---
import AuthMiddleware from '../middlewares/authMiddleware.js';
import UserModel from '../models/user.js'; // Your user model

const router = express.Router();

// Get user profile by ID (requires authentication)
// --- CHANGE THIS LINE ---
router.get('/:id', AuthMiddleware.verifyToken, async (req, res) => {
// --- END CHANGE ---
    try {
        const userId = req.params.id;
        if (req.user.id !== userId) { // This line is causing the error because req.user is undefined or doesn't have 'id'
            return res.status(403).json({ message: 'Forbidden: You can only view your own profile.' });
        }

        const user = await UserModel.findById(userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Format the user data to match your frontend profile state
        const formattedUser = {
            name: user.fullName || `${user.firstName} ${user.lastName}`.trim(), // Or use a 'name' field if you add one to the schema
            email: user.email,
            phone: user.phone || "",
            bio: user.bio || "",
            emergencyContact: user.emergencyContact || { name: "", email: "", phone: "", relationship: "" },
            joinDate: user.createdAt ? user.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            // Include other fields needed by your frontend profile page
        };

        res.status(200).json({ user: formattedUser });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
});

export default router;
