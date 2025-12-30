"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Serialize user for session
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from session
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
// Configure Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
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
        }
        catch (error) {
            console.error('❌ Google auth error:', error);
            done(error, undefined);
        }
    }));
}
else {
    console.warn('⚠️ Google OAuth credentials not configured');
}
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map