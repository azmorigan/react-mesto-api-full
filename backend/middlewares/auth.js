const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized'); // 401
const { NODE_ENV, JWT_SECRET } = process.env;

// Проверяет наличие токена в headers: authorization,
// сравнивает с базой данных и пропускает при совпадении
// Защищает api от незалогиненных пользователей
const auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  // в req.user записывается {_id: id пользователя}
  req.user = payload;
  next();
};

module.exports = auth;
