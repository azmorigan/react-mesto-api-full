const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized'); // 401

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
    payload = jwt.verify(token, 'у_меня_река_только_нет_моста');
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  // в req.user записывается {_id: id пользователя}
  req.user = payload;
  next();
};

module.exports = auth;
