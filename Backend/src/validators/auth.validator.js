export const validateRegisterInput = ({
  name,
  email,
  password,
  referralCode,
}) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password =
      "Password must be at least 8 characters.";
  }

  return errors;
};

export const validateLoginInput = ({
  email,
  password,
}) => {
  const errors = {};

  if (!email) {
    errors.email = "Email is required.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};