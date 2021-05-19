const { celebrate, Joi } = require('celebrate');
const usersRouter = require('express').Router();
const {
  getUsers,
  getUserById,
  editProfile,
  editAvatar,
  getOwnData,
} = require('../controllers/users');
// Роуты пользователей
usersRouter.get('/users', getUsers);

// баг: если поставить роут getOwnData
// после getUserById, выводит ошибку CastError из getUserById.
usersRouter.get('/users/me', getOwnData);

usersRouter.get('/users/:userId',
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().hex().length(24),
    }),
  }), getUserById);

usersRouter.patch('/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }), editProfile);

usersRouter.patch('/users/me/avatar',
  celebrate({
    body: Joi.object().keys({
      // eslint-disable-next-line
      avatar: Joi.string().regex(/(https?:\/\/.*\.(?:png|jpg))/),
    }),
  }), editAvatar);

module.exports = usersRouter;
