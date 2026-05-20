const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path || e.param, message: e.msg }))
    });
  }
  next();
};

const doctorRegisterRules = [
  body("name").trim().notEmpty().withMessage("Name is required")
              .isLength({ max: 100 }).withMessage("Name too long"),
  body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("specialization").trim().notEmpty().withMessage("Specialization is required"),
  body("phone").isMobilePhone("en-IN").withMessage("Valid Indian phone number is required"),
];

const patientRegisterRules = [
  body("name").trim().notEmpty().withMessage("Name is required")
              .isLength({ max: 100 }).withMessage("Name too long"),
  body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("phone").isMobilePhone("en-IN").withMessage("Valid phone number is required"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { validate, doctorRegisterRules, patientRegisterRules, loginRules };
