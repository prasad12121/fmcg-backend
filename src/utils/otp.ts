export const AUTH_CODE_TTL_MINUTES = 15;

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const generateOtpExpiry = () =>
  new Date(Date.now() + AUTH_CODE_TTL_MINUTES * 60 * 1000);
