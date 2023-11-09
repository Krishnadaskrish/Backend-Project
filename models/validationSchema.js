const Joi = require('joi');

const joiUserSchema = Joi.object({
  name: Joi.string(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(30).required(),
});

const joiProductSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().positive(),
    image: Joi.string(),
    description: Joi.string(),
    category: Joi.string()
});

module.exports = { joiUserSchema, joiProductSchema };
