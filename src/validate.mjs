function failed(msg) {
  throw new Error(msg);
}

function validateString(value) {
  if (typeof value !== 'string') {
    failed('must be a string');
  }
  return {
    notEmpty: function() {
      if (!value.length) {
      }
      return this;
    },
  };
}

function validateNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    failed('must be a number');
  }
  return {
    biggerOrEqualThan: function(num) {
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

export default function validate(value) {
  return {
    string: () => validateString(value),
    number: () => validateNumber(value),
    bool: () => validateBoolean(value),
  };
}
