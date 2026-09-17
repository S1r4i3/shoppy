export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^[6-9]\d{9}$/, // 10-digit Indian mobile number
  pincode: /^[1-9]\d{5}$/,
  name: /^[A-Za-z][A-Za-z .'-]{1,49}$/,
};

export function validatePassword(pw = '') {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter.';
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter.';
  if (!/\d/.test(pw)) return 'Password must include a number.';
  return null;
}

export function validateRegistration({ name, email, phone, password, confirmPassword }) {
  const e = {};
  if (!name?.trim()) e.name = 'Full name is required.';
  else if (!patterns.name.test(name.trim())) e.name = 'Enter a valid name (letters only).';
  if (!email?.trim()) e.email = 'Email is required.';
  else if (!patterns.email.test(email.trim())) e.email = 'Enter a valid email address.';
  if (!phone?.trim()) e.phone = 'Phone number is required.';
  else if (!patterns.phone.test(phone.trim())) e.phone = 'Enter a valid 10-digit mobile number.';
  const pwErr = validatePassword(password);
  if (pwErr) e.password = pwErr;
  if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';
  return e;
}

export function validateLogin({ email, password }) {
  const e = {};
  if (!email?.trim()) e.email = 'Email is required.';
  else if (!patterns.email.test(email.trim())) e.email = 'Enter a valid email address.';
  if (!password) e.password = 'Password is required.';
  return e;
}

export function validateProfile({ name, phone }) {
  const e = {};
  if (!name?.trim()) e.name = 'Full name is required.';
  else if (!patterns.name.test(name.trim())) e.name = 'Enter a valid name (letters only).';
  if (!phone?.trim()) e.phone = 'Phone number is required.';
  else if (!patterns.phone.test(phone.trim())) e.phone = 'Enter a valid 10-digit mobile number.';
  return e;
}

export function validateDelivery(d) {
  const e = {};
  if (!d.fullName?.trim()) e.fullName = 'Recipient name is required.';
  else if (!patterns.name.test(d.fullName.trim())) e.fullName = 'Enter a valid name.';
  if (!d.phone?.trim()) e.phone = 'Phone number is required.';
  else if (!patterns.phone.test(d.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number.';
  if (!d.addressLine?.trim()) e.addressLine = 'Address is required.';
  else if (d.addressLine.trim().length < 10) e.addressLine = 'Address looks too short (min 10 characters).';
  if (!d.city?.trim()) e.city = 'City is required.';
  if (!d.state?.trim()) e.state = 'State is required.';
  if (!d.pincode?.trim()) e.pincode = 'PIN code is required.';
  else if (!patterns.pincode.test(d.pincode.trim())) e.pincode = 'Enter a valid 6-digit PIN code.';
  if (!d.paymentMethod) e.paymentMethod = 'Choose a payment method.';
  return e;
}

export function validateQuantity(qty, stock) {
  const n = Number(qty);
  if (!Number.isInteger(n) || n < 1) return 'Quantity must be at least 1.';
  if (n > 10) return 'You can order up to 10 units per item.';
  if (n > stock) return `Only ${stock} left in stock.`;
  return null;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
