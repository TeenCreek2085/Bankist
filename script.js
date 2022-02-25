'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Шаг 1: отрисовка списка транзакций

const displayMovement = (movements, sort = false) => {
  containerMovements.innerHTML = '';

  // Шаг 10.1: Сортировка
  const sortedMovements = sort
    ? movements.slice().sort((a, b) => a - b)
    : movements;

  sortedMovements.forEach((movement, index) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const movementTemplate = `        
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${movement.toFixed(2)}€</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', movementTemplate);
  });
};

// Шаг 2: преобразование имен пользователей в инициалы

const createUsername = accounts => {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsername(accounts);

// Шаг 3: отображение баланса пользователя

const userBalance = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${account.balance.toFixed(2)}€`;
};

//  Шаг 4: отображение суммы поступающих денег в банк, суммы трат и суммы денег от вклада (% от депозита)

const calcSummary = account => {
  const incomes = account.movements
    .filter(movement => movement > 0)
    .reduce((acc, movement) => acc + movement, 0);

  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = account.movements
    .filter(movement => movement < 0)
    .reduce((acc, movement) => acc + movement, 0);

  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const deposit = account.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(movement => movement >= 1)
    .reduce((acc, movement) => acc + movement, 0);

  labelSumInterest.textContent = `${deposit.toFixed(2)}€`;
};

// Шаг 5: Обновление UI

const updateUI = account => {
  displayMovement(account.movements);
  userBalance(account);
  calcSummary(account);
};

// Шаг 6: Вход в аккаунт отдельного пользователя и вывод его баланса
let currentAccount;

btnLogin.addEventListener('click', evt => {
  evt.preventDefault();

  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();

    // Display movements, balance and summary
    updateUI(currentAccount);
  }
});

// Шаг 7: Трансфер денег другому пользователю

btnTransfer.addEventListener('click', evt => {
  evt.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(
    account => account.username === inputTransferTo.value
  );

  inputTransferAmount.value = '';
  inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

// Шаг 8: Удаление аккаунта

btnClose.addEventListener('click', evt => {
  evt.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const accountIndex = accounts.findIndex(
      account => account.username === currentAccount.username
    );

    // Delete account
    accounts.splice(accountIndex, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = '';
  inputClosePin.value = '';
});

// Шаг 9: Возможность взять кредит

btnLoan.addEventListener('click', evt => {
  evt.preventDefault();

  const amount = +inputLoanAmount.value;
  if (
    amount > 0 &&
    currentAccount.movements.some(movement => movement >= amount * 0.1)
  ) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }

  inputLoanAmount.value = '';
});

// Шаг 10.2: Сортировка массива транзакций

let isSorted = false;

btnSort.addEventListener('click', evt => {
  evt.preventDefault();
  displayMovement(currentAccount.movements, !isSorted);
  isSorted = !isSorted;
});

// Шаг 11: Добавление даты

const now = new Date();
const year = now.getFullYear();
const month = `${now.getMonth() + 1}`.padStart(2, 0);
const day = `${now.getDate()}`.padStart(2, 0);
const hour = now.getHours();
const min = now.getMinutes();

labelDate.textContent = `${year}/${month}/${day}, ${hour}:${min}`;
