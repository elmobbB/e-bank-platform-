'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-06-04T23:36:17.929Z',
    '2022-06-06T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
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

/////////////////////////////////////////////////
// Functions
const formatMovementDates = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'today';
  if (daysPassed === 1) return 'yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDates(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};
///////////////////////////////////////
// lecture 181 (implementing a countdown timer)
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // when 0 sec, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    //decrease 1 sec
    time--; //time = time 1 1// cuz it's a timer
  };

  // set time to 5 mins
  let time = 120;

  //call the timer every sec
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer; //we need the variable to persist between different logins

// //fake always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//day/month/year

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //create current date and time
    //experimenting API  (lecture 178)
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      month: 'numeric', //or 2-digit or long
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    //get the date from the user's browser, not define it manually
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0); //padstart only work on strings
    // const month = `${now.getMonth() + 1}`.padStart(2, 0); //zero base, so need to add one
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);

    //reset the timer
    clearInterval(timer); //when we do a money transfer, the imter is cleared and a new timer is started
    timer = startLogOutTimer();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //reset the timer
    clearInterval(timer); //when we do a money transfer, the imter is cleared and a new timer is started
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(() => {
      currentAccount.movements.push(amount);

      //loan dates
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/////////////////////////////////////////////////////
/////////////////////////////////////////////////
// lecture 170 (converting and checking numbers)
/*
console.log(23 === 23.0);
//base 10-0 to 9 1/10=0.1, 3/10 =3.33333
//binary base 2 - 0 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

//convertion
console.log(Number('23'));
console.log(+'23'); //type coercion

//parsing (parse number to a string)
console.log(Number.parseInt('30px', 10)); //base 10
console.log(Number.parseInt('e30', 10)); // the string needs to start with number

console.log(Number.parseInt('2.5rem')); //2 (integer)
console.log(Number.parseFloat('2.5rem')); //2.5

//isNaN = check if value is not a number
console.log(Number.isNaN(20)); //false
console.log(Number.isNaN('20')); //true
console.log(Number.isNaN(+'20X')); //true (becuase it's a string)
console.log(Number.isNaN(23 / 0)); // false (cuz infinity is not a number)

//best way of checking if value is number
console.log(Number.isFinite(20)); //true
console.log(Number.isFinite('20')); //false
console.log(Number.isFinite(23 / 0)); //false

console.log(Number.isInteger(23)); //true
*/
/////////////////////////////////////////////////
// lecture 171 (Math and Rounding)
/*
console.log(Math.sqrt(25)); //5
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3)); //2

//get max value
console.log(Math.max(5, 18, 23, 11, 2)); //23
console.log(Math.max(5, 18, '23', 11, 2)); //23
console.log(Math.max(5, 18, '23px', 11, 2)); //will not do parsing

console.log(Math.min(5, 18, 23, 11, 2)); //2

console.log(Math.PI * Number.parseFloat('10px') ** 2); //area ogf circle with radius

//generate random number
console.log(Math.trunc(Math.random() * 6) + 1);
//genearate integers between two values

const randomInt = (min, max) =>
  Math.trunc(Math.floor() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

//rounding integers
console.log(Math.trunc(23.3));

console.log(Math.round(23.3)); //23
console.log(Math.round(23.9)); //24

console.log(Math.ceil(23.3)); // 24 round up
console.log(Math.ceil(23.9)); // 24 round up

console.log(Math.floor(23.3)); //23 round down
console.log(Math.floor('23.9')); //23

console.log(Math.floor(-23.3)); //-24

//rounding decimals
console.log((2.7).toFixed(0)); //3 (string)
console.log((2.7).toFixed(3)); //2.7 (3 decimal places)
console.log((2.346).toFixed(2)); //2.35
console.log(+(2.346).toFixed(2)); //2.35 (convert to a number)

/////////////////////////////////////////////////
// lecture 172 (remainder operator)
console.log(5 % 2); //1
console.log(5 / 2); //2.5

console.log(8 % 2); //8=2*3+2

console.log(6 % 2); //0

const isEven = n => n % 2 === 0;
console.log(isEven(8)); //true
console.log(isEven(1)); //false

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    //0 2 4 6
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    //0 3 6 9
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
/////////////////////////////////////////////////
// lecture 173  mumeric separators
const diameter = 353_586_560_000;
console.log(diameter); //353586560000

console.log(Number('23_000')); //NaN;
console.log(parseInt('23_000')); //23
/////////////////////////////////////////////////
// lecture 174 big Int
console.log(2 ** 53 - 1); //js's biggest number presented
console.log(2 ** 53 + 1); //wrong
console.log(Number.MAX_SAFE_INTEGER);

console.log(2432432565476555443634n); //big Int
console.log(BigInt(3242543));

//operators
console.log(10000n + 10000n);
// console.log(Math.sqrt(25n));

const huge = 3824897897878978797483n;
const num = 23;
console.log(huge * BigInt(num));

// exceptions
console.log(20n > 15); //true
console.log(20n === 20); //false, diff primitive type
console.log(20 == 20); //true

console.log(huge + ' is really big');

//division
console.log(10n / 3n); //3n
console.log(10 / 3);

*/
/////////////////////////////////////////////////
// lecture 175 creating dates
/*
//create a date
const now = new Date();
console.log(now);

console.log(new Date('Mon Jun 06 2022 10:32:47'));
console.log(new Date('dec 24,2015'));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000)); //three days later

//working with dates
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime()); //2142228185000

console.log(new Date(2142228185000));
console.log(Date.now());

//auto correction
future.setFullYear(2040);
console.log(future);
*/
/////////////////////////////////////////////////
// lecture 177 (operations with dates)
//substraction
/*
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(Number(future));
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const day1 = calcDaysPassed(new Date(2037, 10, 14), new Date(2037, 10, 4));
console.log(day1);
*/
/////////////////////////////////////////////////
// lecture 179 (internationalizing Numbers)
/*
const num = 43434.44;
const options = {
  style: 'currency',
  unit: 'mile-per-hour', //celcius
  currency: 'EUR',
  // useGrouping: false,
};

console.log(`US: `, new Intl.NumberFormat('en-US', options).format(num));
console.log(`Germany: `, new Intl.NumberFormat('de-DE', options).format(num));
console.log(`Hong Kong: `, new Intl.NumberFormat('hk-HK', options).format(num));
console.log(`Syria: `, new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
/////////////////////////////////////////////////
// lecture 180 (timers: setTimeout and setInterval)

const ingredients = ['olives', 'spinach'];
//when the execution of our code reaches 3 sec, iw till call the set timer function , it will then register the calback function to be called
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
); //appear after 3 sec
console.log('Waiting');
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//setInterval (sth to run over and over again after certain time)
// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 1000);

// //challenge
// const now = new Date();
// const optio = {
//   hour: 'numeric',
//   minute: 'numeric',
//   second: 'numeric',
// };

// setInterval(function () {
//   const now = new Date();
//   console.log(new Intl.DateTimeFormat('en-US', optio).format(now));
// }, 1000);
*/
