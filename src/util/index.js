import q from "nikolav-q";
import chartDonut from "./chartDonut";
import ColorMode from "./color-mode";
import download from "./download";
import map from "./map";

const identity = (id) => id;
const { eventListener } = q;
const { add: classAdd, rm: classRemove } = q.class;
const { noop } = q.func;

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
export {
  chartDonut,
  classAdd,
  classRemove,
  ColorMode,
  download,
  eventListener,
  identity,
  map,
  moneyFormat,
  moneyFormatDollar,
  noop,
};
