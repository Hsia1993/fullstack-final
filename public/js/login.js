"use strict";

$(document).ready(() => {
  onFormSubmit({
    formId: "login",
    validators: ({ required, isEnglishName, isPositiveInterget, isYear }) => ({
      username: [required],
      password: [required],
    }),
    onSubmit: (data) => {
      $.ajax({
        url: "/api/login",
        method: "post",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: (resp) => {
          window.location.replace("/");
        },
      }).fail(function (xhr) {
        $("#submitButton").after(`
            <div class="alert alert-danger mt-5 form-result" role="alert">
              Username do not exist or wrong password
            </div>
        `);
      });
    },
  });
});
