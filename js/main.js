const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished',
};

const cardsElement = document.querySelector('#cards');
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', // 梅花
];

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());

    for (let i = number.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [number[i], number[randomIndex]] = [number[randomIndex], number[i]];
    }

    return number;
  },
};

const model = {
  revealedCards: [],
  triedTimes: 0,
  score: 0,

  isRevealedCardsMatched() {
    const firstCard = Number(this.revealedCards[0].dataset.number);
    const secondCard = Number(this.revealedCards[1].dataset.number);
    const isMatched = firstCard % 13 === secondCard % 13;
    return isMatched;
  },
};

const view = {
  getCardElement(index) {
    const number = (index % 13) + 1;
    const symbol = Symbols[Math.floor(index / 13)];
    const template = `
      <li class="card flex column jc-between" data-is-fliped="false" data-number="${index}">
        <img 
          class="card-back"
          src="https://assets-lighthouse.alphacamp.co/uploads/image/file/9222/ExportedContentImage_00.png"
          alt="card back" 
        />
        <p class="my-0 p-2">${this.transformNumber(number)}</p>
        <img src="${symbol}" alt="symbol" />
        <p class="my-0 p-2">${this.transformNumber(number)}</p>
      </li>
    `;

    return template;
  },

  displayCards(randomNumberArray) {
    const rootElement = document.querySelector('#cards');

    rootElement.innerHTML = randomNumberArray.map((index) => this.getCardElement(index)).join('');
  },

  transformNumber(number) {
    let transformedNumber = '';

    switch (number) {
      case 1:
        transformedNumber = 'A';
        break;
      case 11:
        transformedNumber = 'J';
        break;
      case 12:
        transformedNumber = 'Q';
        break;
      case 13:
        transformedNumber = 'K';
        break;
      default:
        transformedNumber = number;
    }

    return transformedNumber;
  },

  flipCards(...cards) {
    cards.forEach((card) => {
      const cardElement = card;
      const { isFliped } = card.dataset;

      if (isFliped === 'true') {
        cardElement.dataset.isFliped = false;
      } else {
        cardElement.dataset.isFliped = true;
      }
    });
  },

  pairCards(...cards) {
    cards.forEach((card) => {
      const cardElement = card;

      cardElement.classList.add('paired');
    });
  },

  renderScore(score) {
    const scoreElement = document.querySelector('#score');

    scoreElement.textContent = score;
  },

  renderTriedTimes(times) {
    const triedTimesElement = document.querySelector('#tried-times');

    triedTimesElement.textContent = times;
  },

  appendWrongAnimation(...cards) {
    cards.forEach((card) => {
      card.classList.add('wrong');
    });
  },

  removeWrongAnimation(...cards) {
    cards.forEach((card) => {
      card.classList.remove('wrong');
    });
  },

  showFinished() {
    const completeElement = document.querySelector('.complete-content');

    completeElement.parentElement.dataset.isCompleted = true;
    completeElement.innerHTML = `
      <p class="fs-2xl text-dark-info m-0">Complete!</p>
      <p class="mb-0 fs-lg">Score: <span class="score">${model.score}</span></p>
      <p class="my-0 fs-lg">You've tried: <span class="tried-time">${model.triedTimes}</span> times</p>
    `;
  },
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  dispatchCardAction(card) {
    const { isFliped } = card.dataset;

    if (isFliped === 'false') {
      switch (this.currentState) {
        case GAME_STATE.FirstCardAwaits:
          view.flipCards(card);
          model.revealedCards.push(card);
          this.currentState = GAME_STATE.SecondCardAwaits;
          break;

        case GAME_STATE.SecondCardAwaits:
          view.flipCards(card);
          model.revealedCards.push(card);
          model.triedTimes += 1;
          view.renderTriedTimes(model.triedTimes);

          if (model.isRevealedCardsMatched()) {
            this.currentState = GAME_STATE.CardMatched;
            view.pairCards(...model.revealedCards);
            model.score += 10;
            view.renderScore(model.score);

            if (model.score === 260) {
              this.currentState = GAME_STATE.GameFinished;
              view.showFinished();
            } else {
              this.currentState = GAME_STATE.FirstCardAwaits;
            }

            model.revealedCards.splice(0);
          } else {
            this.currentState = GAME_STATE.CardMatchFailed;
            view.appendWrongAnimation(...model.revealedCards);
            setTimeout(this.resetCards, 1000);
          }

          break;
      }
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards);
    controller.currentState = GAME_STATE.FirstCardAwaits;
    view.removeWrongAnimation(...model.revealedCards);
    model.revealedCards.splice(0);
  },
};

controller.generateCards();

cardsElement.addEventListener('click', (event) => {
  const { target } = event;

  if (target.matches('.card')) {
    controller.dispatchCardAction(target);
  } else if (target.parentElement.matches('.card')) {
    controller.dispatchCardAction(target.parentElement);
  }
});
