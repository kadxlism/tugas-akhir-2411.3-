// src/utils/validators.ts
export const isEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  return password.length >= 6;
};