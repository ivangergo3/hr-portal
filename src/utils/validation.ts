import { differenceInDays, isBefore, startOfToday } from "date-fns";

export const PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^\+?[\d\s-]{10,}$/,
  NAME: /^[A-Za-z\s'-]{2,}$/,
  HOURS: /^\d{1,2}(\.\d{0,2})?$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&-]{8,}$/,
};

export const LIMITS = {
  MAX_DAILY_HOURS: 24,
  MAX_WEEKLY_HOURS: 168,
  MAX_TIME_OFF_DAYS: 30,
  MIN_PASSWORD_LENGTH: 16,
  MAX_NAME_LENGTH: 255,
  MAX_CLIENT_NAME_LENGTH: 255,
  MAX_PROJECT_NAME_LENGTH: 255,
  MAX_REASON_LENGTH: 500,
  MAX_EMAIL_LENGTH: 255,
  MAX_PASSWORD_LENGTH: 255,
};

export const validateTimeOff = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = startOfToday();

  if (isBefore(start, today)) {
    return "Start date cannot be in the past";
  }

  if (isBefore(end, start)) {
    return "End date must be after start date";
  }

  const duration = differenceInDays(end, start);
  if (duration > LIMITS.MAX_TIME_OFF_DAYS) {
    return `Time off request cannot exceed ${LIMITS.MAX_TIME_OFF_DAYS} days`;
  }

  return null;
};

export const validateHours = (hours: Record<string, string>) => {
  const dailyHours = Object.values(hours).map((h) => parseFloat(h) || 0);

  // Check each day's hours
  const invalidDay = dailyHours.findIndex(
    (h) => h < 0 || h > LIMITS.MAX_DAILY_HOURS,
  );
  if (invalidDay !== -1) {
    return `Invalid hours for ${Object.keys(hours)[invalidDay]}`;
  }

  // Check weekly total
  const totalHours = dailyHours.reduce((sum, h) => sum + h, 0);
  if (totalHours > LIMITS.MAX_WEEKLY_HOURS) {
    return `Total hours cannot exceed ${LIMITS.MAX_WEEKLY_HOURS}`;
  }

  return null;
};

export const validatePassword = (password: string) => {
  if (password.length < LIMITS.MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.length > LIMITS.MAX_PASSWORD_LENGTH) {
    return `Password cannot exceed ${LIMITS.MAX_PASSWORD_LENGTH} characters`;
  }

  if (!PATTERNS.PASSWORD.test(password)) {
    return "Password must contain at least one letter and one number";
  }

  return null;
};

export const validateEmail = (email: string) => {
  if (!PATTERNS.EMAIL.test(email)) {
    return "Please enter a valid email address";
  }
  if (email.length > LIMITS.MAX_EMAIL_LENGTH) {
    return `Email cannot exceed ${LIMITS.MAX_EMAIL_LENGTH} characters`;
  }
  return null;
};

export const validateName = (name: string) => {
  if (name.length > LIMITS.MAX_NAME_LENGTH) {
    return `Name cannot exceed ${LIMITS.MAX_NAME_LENGTH} characters`;
  }
  if (!PATTERNS.NAME.test(name)) {
    return "Please enter a valid name";
  }
  return null;
};

export const validateClientName = (name: string) => {
  if (name.length > LIMITS.MAX_CLIENT_NAME_LENGTH) {
    return `Name cannot exceed ${LIMITS.MAX_CLIENT_NAME_LENGTH} characters`;
  }
  return null;
};

export const validateProjectName = (name: string) => {
  if (name.length > LIMITS.MAX_PROJECT_NAME_LENGTH) {
    return `Name cannot exceed ${LIMITS.MAX_PROJECT_NAME_LENGTH} characters`;
  }
  return null;
};

export const validateRequired = (value: string, fieldName: string) => {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateLength = (
  value: string,
  fieldName: string,
  maxLength: number,
) => {
  if (value.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  return null;
};
