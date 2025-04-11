
/**
 * Utility functions for generating and managing daily verification codes
 */

/**
 * Generates a daily verification code based on the current date
 * This ensures the code changes every day
 * @returns {string} The verification code for today
 */
export const generateDailyCode = (): string => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  
  // Create a seed value based on the date
  const seed = day * month * (year % 100);
  
  // Generate a pseudo-random 6-digit code based on the date
  const code = String(Math.floor((Math.sin(seed) * 0.5 + 0.5) * 1000000)).padStart(6, '0');
  
  return code;
};

/**
 * Returns the current daily verification code
 * @returns {string} The verification code for today
 */
export const getDailyCode = (): string => {
  return generateDailyCode();
};

/**
 * Validates if the provided code matches today's verification code
 * @param {string} code - The code to validate
 * @returns {boolean} Whether the code is valid
 */
export const validateDailyCode = (code: string): boolean => {
  const dailyCode = getDailyCode();
  return code === dailyCode;
};
