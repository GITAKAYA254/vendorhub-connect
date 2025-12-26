
export const verifyMpesaCallback = (req, res, next) => {
    // 1. Enforce HTTPS
    const isHttps = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps && process.env.NODE_ENV === 'production') {
        console.warn(`[MPESA-SECURITY] Rejected non-HTTPS request from ${req.ip}`);
        return res.status(403).json({ error: 'HTTPS required' });
    }

    // 2. Secret Token Verification (recommended over IP check alone)
    const secret = process.env.MPESA_CALLBACK_TOKEN;
    if (!secret) {
        console.warn('MPESA_CALLBACK_TOKEN not configured, skipping validation (unsafe for production)');
        return next();
    }

    const authHeader = req.headers.authorization;
    const queryToken = req.query.token;

    // Check Authorization: Bearer <token> or ?token=<token>
    const providedToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;

    if (!providedToken || providedToken !== secret) {
        console.warn(`[MPESA-SECURITY] Invalid callback token from ${req.ip}`);
        return res.status(401).json({ error: 'Unauthorized callback' });
    }

    next();
};
