export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'Email is required' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Password is required' };
  
  const requirements = [
    { test: /.{10,}/, message: 'At least 10 characters' },
    { test: /[A-Z]/, message: 'One uppercase letter' },
    { test: /[a-z]/, message: 'One lowercase letter' },
    { test: /[0-9]/, message: 'One number' },
    { test: /[!@#$%^&*(),.?":{}|<>]/, message: 'One special character' }
  ];

  const results = requirements.map(req => ({
    ...req,
    passed: req.test.test(password)
  }));

  return {
    isValid: results.every(r => r.passed),
    requirements: results
  };
}; 