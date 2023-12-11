"use strict";

const sameWithPassword = (val, { password }) => {
  if (val !== password) {
    throw "Should same with password";
  }
};
$(document).ready(() => {
  onFormSubmit({
    formId: "signup",
    validators: ({ required }) => ({
      username: [required],
      password: [required],
      repeatedPassword: [required, sameWithPassword],
      userType: [],
    }),
    onSubmit: (data) => {
      $.ajax({
        url: "/api/signup",
        method: "post",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: (resp) => {
          $("#submitButton").after(`
            <div class="alert alert-success mt-5 form-result" role="alert">
              You have signed up successfully
            </div>
        `);
          setTimeout(() => {
            window.location.replace("/login");
          });
        },
      }).fail(function (xhr) {
        $("#submitButton").after(`
            <div class="alert alert-danger mt-5 form-result" role="alert">
              Username has been used.
            </div>
        `);
      });
    },
  });
});
