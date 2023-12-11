"use strict";

const onFormSubmit = ({ formId, onSubmit, validators }) => {
  const datePattern =
    /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/\-]\d{4}$/;
  const namePattern = /^[a-zA-Z]+$/;
  $(`#${formId}`).on("submit", function (event) {
    $(".form-result").remove();
    event.preventDefault();
    let canSubmit = true;
    // validators are functions which take the value, if does not pass the validation, it throws a error.

    // validator for required field
    const required = (str) => {
      if (str === "") {
        throw "This field is required.";
      }
    };
    // validator for a postive integer
    const isPositiveInterget = (str) => {
      const number = Number(str);
      if (!Number.isInteger(number)) {
        throw "Must be a integer.";
      }
      if (number <= 0) {
        throw "Must be greater than 0.";
      }
    };
    const isYear = (str) => {
      if (!/^(19|20)\d{2}$/.test(str)) {
        throw "Must be a valid year";
      }
    };
    const isDate = (str) => {
      if (!datePattern.test(str)) {
        throw "Must be in the format of dd/mm/yyyy.";
      }
    };
    const isEnglishName = (str) => {
      if (!namePattern.test(str)) {
        throw "Not a valid name";
      }
    };

    // show the error message for a domId
    const displayErrorMsg = (domId, msg) => {
      $(`#${formId} #${domId}`).addClass("is-invalid");
      $(`#${formId} #${domId}`).after(
        `<div class="invalid-feedback" id="${domId}-error">${msg}</div>`
      );
    };
    // The object for validation, the key is the dom ID, value is a array of validators
    const domIdToValidators = validators({
      required,
      isPositiveInterget,
      isYear,
      isDate,
      isEnglishName,
    });
    let postData = {};
    // Iterate the domId and validate
    Object.keys(domIdToValidators).forEach((domId) => {
      // get each value and then trim spaces
      const value = ($(`#${domId}`).val() || "").trim();
      // get the array of validators
      postData[domId] = value;
      const validators = domIdToValidators[domId];
      // validate the value by each validator
      for (let i = 0; i < validators.length; i++) {
        // get each validator
        const validator = validators[i];
        // remove the previous error message dom

        $(`#${formId} #${domId}`).removeClass("is-invalid");
        $(`#${formId} #${domId}-error`).remove();
        // try validating the value
        try {
          // run validator with the dom value
          validator(value, postData);
        } catch (e) {
          // not pass catch it and then display the error dom
          displayErrorMsg(domId, e);
          //set the flag to false
          canSubmit = false;
          // break the loop, because if first validator failed we don't neet to validate the upcoming ones
          break;
        }
      }
    });
    if (canSubmit) {
      onSubmit(postData);
    }
  });
};
