const Card = require('../models/card');

// Ошибки
const BadRequestError = require('../errors/badRequest'); // 400
const ForbiddenError = require('../errors/forbidden'); // 403
const NotFoundError = require('../errors/notFound'); // 404

// Вывести все карточки
const getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

// Создать карточку
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  if (!name || !link) {
    throw new BadRequestError('Переданы некорректные данные при создании карточки.');
  }
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(200).send(card);
    })
    .catch(next);
};

// Удалить карточку
const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (card.owner._id.toString() !== req.user._id) {
        throw new ForbiddenError('Нельзя удалить чужую карточку.');
      }
      Card.findByIdAndRemove(req.params.cardId)
        .then((deletingCard) => {
          res.status(200).send(deletingCard);
        });
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные.');
      }
      next(err);
    })
    .catch(next);
};
// Поставить лайк карточке
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные для постановки лайка.');
      }
      next(err);
    })
    .catch(next);
};

// Убрать лайк у карточки
const dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Карточка с указанным _id не найдена.');
    }
    res.status(200).send(card);
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      throw new BadRequestError('Переданы некорректные данные для снятия лайка.');
    }
    next(err);
  })
  .catch(next);

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
