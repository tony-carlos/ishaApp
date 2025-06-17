// Email validation using a standard regex pattern
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  // Check if the number has at least 10 digits
  return cleanNumber.length >= 10;
};

export const getEncouragementMessage = () => {
  const messages = [
    "You're doing great! Keep going!",
    'Every step counts toward healthier skin.',
    'Consistency is key—your skin will thank you!',
    'Small changes make a big difference.',
    "You're one step closer to your skincare goals!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

// Helper to simulate API calls with a delay
export const mockApiCall = (delay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Helper to generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Format date for display
export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
};

// Get initials from a full name
export const getInitials = (fullName: string): string => {
  if (!fullName) return '';

  return fullName
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
