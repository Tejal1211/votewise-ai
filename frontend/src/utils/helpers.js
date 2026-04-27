// Utility functions for VoteWise AI

/**
 * Formats a date string into a localized Indian date format.
 * @param {string} dateString - The date string to format.
 * @returns {string} Formatted date (e.g., "January 15, 2024").
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculates the number of days from today until the target date.
 * @param {string} dateString - Target date string.
 * @returns {number} Days remaining (positive) or passed (negative).
 */
export const calculateDaysUntil = (dateString) => {
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Returns the election status based on the date.
 * @param {string} dateString - Election date.
 * @returns {string} 'completed', 'today', 'soon', or 'upcoming'.
 */
export const getElectionStatus = (dateString) => {
  const days = calculateDaysUntil(dateString);
  if (days < 0) return 'completed';
  if (days === 0) return 'today';
  if (days <= 7) return 'soon';
  return 'upcoming';
};

/**
 * Validates an email address format.
 * @param {string} email - Email to validate.
 * @returns {boolean} True if valid.
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates if an age is within a reasonable range (0-120).
 * @param {string|number} age - Age to validate.
 * @returns {boolean} True if valid.
 */
export const validateAge = (age) => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 120;
};

/**
 * Returns the full name of a language code.
 * @param {string} code - 'en', 'hi', or 'mr'.
 * @returns {string} Full language name.
 */
export const getLanguageName = (code) => {
  const languages = {
    en: 'English',
    hi: 'हिंदी',
    mr: 'मराठी'
  };
  return languages[code] || 'English';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};