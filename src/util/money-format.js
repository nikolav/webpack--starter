const moneyFormat = (number) =>
  // parse string numerics
  Number(number)
    // all numbers get parseInt-ed
    // so append `.00`
    .toFixed(2)
    // place comma if number is followed by groups of 3 numbers ending with .dot
    // replace @current position
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");

const moneyFormatDollar = (num) => `$ ${moneyFormat(num)}`;

//
export { moneyFormat, moneyFormatDollar };
