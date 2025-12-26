import axios from 'axios';

/**
 * Get Access Token for M-Pesa API.
 * Supports passing custom credentials for multi-vendor distributed setup.
 */
const getAccessToken = async (customCreds = null) => {
    const consumerKey = customCreds?.consumerKey || process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = customCreds?.consumerSecret || process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error('M-Pesa Consumer Key or Secret missing');
    }

    const authUrl =
        process.env.MPESA_ENV === 'production'
            ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(authUrl, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('M-Pesa Token Error:', error.response?.data || error.message);
        throw new Error('Failed to get M-Pesa access token. Check credentials.');
    }
};

/**
 * Initiate STK Push (Lipa na M-Pesa Online).
 * Now accepts a 'vendorConfig' object for multi-vendor support.
 */
export const initiateSTKPush = async ({ phoneNumber, amount, reference, description, vendorConfig = null }) => {
    // Determine which credentials to use
    // If vendorConfig is provided, it can override global settings
    const shortCode = vendorConfig?.shortCode || process.env.MPESA_SHORTCODE;
    const passkey = vendorConfig?.passkey || process.env.MPESA_PASSKEY;

    // For distributed credentials (Option 2)
    const token = await getAccessToken(vendorConfig?.consumerKey ? vendorConfig : null);

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    const url =
        process.env.MPESA_ENV === 'production'
            ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const data = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: vendorConfig?.type === 'PB' ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline',
        Amount: Math.ceil(amount),
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: reference,
        TransactionDesc: description || `Payment for ${reference}`,
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('STK Push Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.errorMessage || 'STK Push failed');
    }
};
