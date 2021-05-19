const { celebrate, Joi } = require('celebrate');
const cardsRouter = require('express').Router();
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

// Роуты карточек
cardsRouter.get('/cards', getCards);

cardsRouter.post('/cards',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      // eslint-disable-next-line
      link: Joi.string().required().regex(/(https?:\/\/.*\.(?:png|jpg))/),
    }),
  }), createCard);

cardsRouter.delete('/cards/:cardId',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }), deleteCard);

cardsRouter.put('/cards/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }), likeCard);

cardsRouter.delete('/cards/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }), dislikeCard);

module.exports = cardsRouter;
