const Joi = require('joi');

const validateUser = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    full_name: Joi.string().required(),
    initial_balance: Joi.number().positive()
  });

  return schema.validate(data);
};

const validatePortfolio = (data) => {
  const schema = Joi.object({
    portfolio_name: Joi.string().required(),
    initial_balance: Joi.number().positive()
  });

  return schema.validate(data);
};

const validateOrder = (data) => {
  const schema = Joi.object({
    symbol: Joi.string().required(),
    order_type: Joi.string().valid('market', 'limit').required(),
    action: Joi.string().valid('buy', 'sell').required(),
    quantity: Joi.number().positive().required(),
    price: Joi.number().positive()
  });

  return schema.validate(data);
};

module.exports = {
  validateUser,
  validatePortfolio,
  validateOrder
};
