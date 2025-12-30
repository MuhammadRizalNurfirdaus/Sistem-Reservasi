import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Serialize user for session
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Configure Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            let user = await prisma.user.findUnique({
                where: { googleId: profile.id }
            });

            if (!user) {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        googleId: profile.id,
                        email: profile.emails?.[0]?.value || '',
                        name: profile.displayName,
                        avatar: profile.photos?.[0]?.value
                    }
                });
                console.log('✅ Created new user:', user.email);
            }

            done(null, user);
        } catch (error) {
            console.error('❌ Google auth error:', error);
            done(error as Error, undefined);
        }
    }));
} else {
    console.warn('⚠️ Google OAuth credentials not configured');
}

export default passport;
