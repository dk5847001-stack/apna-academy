export const validateCourseInput = ({
  title,
  shortDescription,
  description,
  category,
  level,
  language,
  price,
  durationDays,
}) => {
  const errors = {};

  if (!title || title.trim().length < 3) {
    errors.title = "Course title must be at least 3 characters.";
  }

  if (!shortDescription || shortDescription.trim().length < 10) {
    errors.shortDescription =
      "Short description must be at least 10 characters.";
  }

  if (!description || description.trim().length < 20) {
    errors.description =
      "Course description must be at least 20 characters.";
  }

  if (!category || category.trim().length < 2) {
    errors.category = "Course category is required.";
  }

  if (!level || level.trim().length < 2) {
    errors.level = "Course level is required.";
  }

  if (!language || language.trim().length < 2) {
    errors.language = "Course language is required.";
  }

  if (
    price !== undefined &&
    (Number.isNaN(Number(price)) || Number(price) < 0)
  ) {
    errors.price = "Course price must be a valid non-negative number.";
  }

  if (
    durationDays !== undefined &&
    (!Number.isInteger(Number(durationDays)) ||
      Number(durationDays) <= 0)
  ) {
    errors.durationDays =
      "Duration must be a positive number of days.";
  }

  return errors;
};