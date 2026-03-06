import { Router, Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user.model.js';
import { generateTokenPair } from '../utils/tokens.js';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate user with Google OAuth
 * @access  Public
 */
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required'
            });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Google token'
            });
        }

        const { email, given_name, family_name, picture, sub: googleId } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                nom: family_name || 'Google',
                prenom: given_name || 'User',
                email,
                googleId,
                avatarUrl: picture,
                role: 'employe', // Default role for Google sign-ups
                emailVerified: true, // Google emails are verified
                authProvider: 'google',
                plan: 'essai'
            });
        } else {
            // Update existing user with Google info if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.emailVerified = true;
                user.authProvider = 'google';
                if (picture && !user.avatarUrl) {
                    user.avatarUrl = picture;
                }
                await user.save();
            }
        }

        // Generate JWT token pair with RS256
        const { accessToken, refreshToken } = generateTokenPair({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            farmId: user.farmId?.toString(),
            plan: user.plan,
            organizationId: user.organizationId?.toString()
        } as any);

        // Set cookies (standard practice now)
        res.cookie('access_token', accessToken, { httpOnly: true, sameSite: 'strict' });
        res.cookie('refresh_token', refreshToken, { httpOnly: true, path: '/api/auth/refresh' });

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error: any) {
        console.error('Google OAuth error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message
        });
    }
});

export default router;
