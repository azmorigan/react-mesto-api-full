const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Ошибки
const BadRequestError = require('../errors/badRequest'); // 400
const NotFoundError = require('../errors/notFound'); // 404
const ConflictError = require('../errors/conflict'); // 409

// Вывести всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

// Вывести пользователя по id
const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные.');
      }
      next(err);
    })
    .catch(next);
};

// Регистрация пользователя; email, password - обязательные
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(200).send(
        {
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
        },
      );
    })
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже существует.');
      }
      if (err.errors.email) {
        throw new BadRequestError(err.errors.email.message);
      }
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании пользователя.');
      }
      next(err);
    })
    .catch(next);
};

// Редактировать поля name и about пользователя
const editProfile = (req, res, next) => {
  const { name, about } = req.body;
  if (!name || !about) {
    throw new BadRequestError('Переданы некорректные данные при обновлении профиля.');
  }
  User.findByIdAndUpdate(req.user._id, { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    })
    .then((user) => {
      // Ошибка не выполниться, req.user._id точно будет в базе,
      // т.к. данная ф-ия выполнится только после авторизации
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден.');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      // Тоже не должна выполниться
      // Оставляю на всякий случай
      if (err.name === 'CastError') {
        throw new BadRequestError('Передан некорректный _id при обновлении профиля.');
      }
      next(err);
    })
    .catch(next);
};

// Поменять поле avatar
const editAvatar = (req, res, next) => {
  const { avatar } = req.body;
  if (!avatar) {
    throw new BadRequestError('Переданы некорректные данные при обновлении аватара.');
  }
  User.findByIdAndUpdate(req.user._id, { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    })
    .then((user) => {
      // Тоже не должна выполниться
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден.');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.errors.avatar) {
        throw new BadRequestError(err.errors.avatar.message);
      }
      // Тоже не должна выполниться
      if (err.name === 'CastError') {
        throw new BadRequestError('Передан некорректный _id при обновлении аватара.');
      }
      next(err);
    })
    .catch(next);
};

// Залогиниться в аккаунт
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'у_меня_река_только_нет_моста',
        { expiresIn: '7d' },
      );
      // res.cookie('jwt', token,
      //   {
      //     maxAge: 3600000 * 24 * 7,
      //     httpOnly: true,
      //     sameSite: true,
      //   });
      res.send({ jwt: token });
    })
    .catch((err) => {
      if (err.errors.email) {
        throw new BadRequestError(err.errors.email.message);
      }
      next(err);
    })
    .catch(next);
};

// Получить информацию о текущем пользователе
const getOwnData = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      // Тоже не должна выполниться
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден.');
      }
      res.send(user);
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  editProfile,
  editAvatar,
  login,
  getOwnData,
};
