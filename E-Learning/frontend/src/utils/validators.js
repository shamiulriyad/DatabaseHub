export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const field in rules) {
    const value = formData[field];
    const rule = rules[field];
    
    if (rule.required && !value) {
      errors[field] = `${field} is required`;
    } else if (rule.type === 'email' && value && !validateEmail(value)) {
      errors[field] = 'Invalid email';
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `Minimum ${rule.minLength} characters required`;
    }
  }
  
  return errors;
};
