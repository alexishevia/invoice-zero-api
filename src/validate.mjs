import { isValidDayStr } from "./date.mjs";

function failed(msg) {
  throw new Error(msg);
}

function validateString(value) {
  if (typeof value !== "string") {
    failed("must be a string");
  }
  return {
    notEmpty: () => {
      if (!value.length) {
        failed("cannot be empty");
      }
      return this;
    },
  };
}

function validateNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    failed("must be a number");
  }
  return {
    biggerThan: (num) => {
      if (value <= num) {
        failed(`must be bigger than ${num}`);
      }
      return this;
    },
    biggerOrEqualThan: (num) => {
      if (value < num) {
        failed(`must be bigger or equal than ${num}`);
      }
      return this;
    },
  };
}

function validateInteger(value) {
  if (!Number.isInteger(value)) {
    failed("must be an integer");
  }
  return {
    biggerThan: (num) => {
      if (value <= num) {
        failed(`must be bigger than ${num}`);
      }
      return this;
    },
    biggerOrEqualThan: (num) => {
      if (value < num) {
        failed(`must be bigger or equal than ${num}`);
      }
      return this;
    },
  };
}

function validateBoolean(value) {
  if (typeof value !== "boolean") {
    failed("must be a boolean");
  }
}

function validateDayString(value) {
  if (!isValidDayStr(value)) {
    failed("must match YYYY-MM-DD");
  }
}

export default function validate(value) {
  return {
    string: () => validateString(value),
    number: () => validateNumber(value),
    integer: () => validateInteger(value),
    bool: () => validateBoolean(value),
    dayString: () => validateDayString(value),
  };
}
