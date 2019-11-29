module.exports = {
    PORT: process.env.PORT || 8000,
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'techbookapp@gmail.com',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DATABASE_URL || "postgresql://dunder-mifflin:kinnefam999@localhost/techbook",
    JWT_EXPIRY: process.env.JWT_EXPIRY || 360000,
    // remember to make a secret in the env
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
}

