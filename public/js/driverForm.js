"use strict";

$(document).ready(async () => {
  const isG2 = window.location.pathname == "/g2";
  if (isG2) {
    $("#g2").removeClass("d-none");
  }
  const appointmentResp = await fetch("/api/appointments");

  const { data: appointments } = await appointmentResp.json();
  const format = (dateStr) => moment(dateStr).format("YYYY-MM-DD HH:mm:ss");
  const resp = await fetch("/api/self");
  const { data } = await resp.json();
  appointments.forEach(({ isAvailable, start, end, _id }) => {
    if (isAvailable || _id == data.appointment) {
      $("#appointment").append(
        `<option value="${_id}">${format(start)}-${format(end)}</option>`
      );
    }
  });
  const { _id, car_detail, age, firstName, lastName, licenseNo, appointment } =
    data;
  if (car_detail) {
    $(".g2-submit").text("Edit");
    $("#g2").removeClass("d-none");
    let { make, model, year, platNo } = car_detail;
    let data = {
      age,
      firstName,
      licenseNo,
      lastName,
      make,
      model,
      year,
      appointment,
      platNo,
    };
    Object.keys(data).forEach((key) => {
      let $el = $(`#${key}`);
      $el.val(data[key]);
      if ($el.data("canedit") === false) {
        $el.attr("disabled", true);
      }
    });
  } else {
    if (!isG2) {
      $("p").after(`
            <div class="alert alert-danger mt-5 form-result" role="alert">
              No information found, please go to <a href="/g2">G2</a> page.
            </div>
      `);
    }
  }
  onFormSubmit({
    formId: "g2",
    validators: ({
      required,
      isEnglishName,
      isPositiveInterget,
      // isDate,
      isYear,
    }) => ({
      firstName: [required, isEnglishName],
      lastName: [required, isEnglishName],
      licenseNo: [required],
      age: [required, isPositiveInterget],
      make: [required],
      model: [required],
      year: [required, isYear],
      platNo: [required],
      appointment: [required],
    }),
    onSubmit: ({
      firstName,
      lastName,
      licenseNo,
      age,
      make,
      model,
      year,
      appointment,
      platNo,
    }) => {
      $.ajax({
        url: `/api/user/${_id}`,
        method: "put",
        contentType: "application/json",
        data: JSON.stringify({
          firstName,
          lastName,
          typeType: isG2 ? "G2" : "G",
          licenseNo: licenseNo,
          appointment,
          age: parseInt(age),
          // dob,
          car_detail: {
            make,
            model,
            year: parseInt(year),
            platNo,
          },
        }),
        success: (resp) => {
          $(".g2-submit").after(`
            <div class="alert alert-success mt-5 form-result" role="alert">
                You have changed successfully.
            </div>
        `);
        },
      }).fail(function (xhr) {
        $(".g2-submit").after(`
            <div class="alert alert-danger mt-5 form-result" role="alert">
                This license number has been used.
            </div>
        `);
      });
    },
  });
});
