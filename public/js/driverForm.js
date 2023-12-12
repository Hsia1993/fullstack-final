"use strict";

$(document).ready(async () => {
  const isG2 = window.location.pathname == "/g2";
  const appointmentResp = await fetch("/api/appointments");

  const { data: appointments } = await appointmentResp.json();
  const format = (dateStr) => moment(dateStr).format("YYYY-MM-DD HH:mm:ss");
  const resp = await fetch("/api/self");
  const { data } = await resp.json();
  if (isG2) {
    $("#g2").removeClass("d-none");
    if (data.testType == "G") {
      $("#g2").html(`
      <div class="alert alert-info" role="alert">
        You have passed G2 test, continue your G test.
      </div>`);
    } else if (!!data.appointment?.examiner) {
      const { passed, comment } = data.appointment;
      $("#g2").html(`
      <div class="alert alert-${passed ? "success" : "danger"}" role="alert">
        ${passed ? "You passed the exam." : "You didn't passed the exam."}
        <br/>
        Comment from examiner: ${comment}
        <br/>
        <button type="button" class="btn btn-primary" id="test-result-btn">
          ${passed ? "Schedule G test" : "Reschedule G2 test"}
        </button>
      </div>`);
    }
  } else {
    if (data.testType == "G") {
      $(".g-tip").text("Book your G test.");
      $("#g2").removeClass("d-none");
      if (!!data.appointment?.examiner) {
        const { passed, comment } = data.appointment;
        $("#g2").html(`
      <div class="alert alert-${passed ? "success" : "danger"}" role="alert">
        ${passed ? "You passed the exam." : "You didn't passed the exam."}
        <br/>
        Comment from examiner: ${comment}
        <br/>
        ${
          passed
            ? ""
            : `
        <button type="button" class="btn btn-primary" id="test-result-btn">
          Reschedule G test
        </button>
        `
        }
      </div>`);
      }
    }
  }

  $("#test-result-btn").click(() => {
    const passed = data.appointment.passed;
    $.ajax({
      url: passed ? "/api/user/appointment/g" : "/api/user/appointment",
      method: "put",
      contentType: "application/json",
      success: (resp) => {
        if (passed) {
          window.location.replace("/g");
        } else {
          window.location.reload();
        }
      },
    }).fail(function (xhr) {});
  });
  appointments.forEach(({ isAvailable, start, end, _id }) => {
    if (isAvailable || _id == data.appointment?._id) {
      $("#appointment").append(
        `<option value="${_id}">${format(start)}-${format(end)}</option>`
      );
    }
  });
  const { _id, car_detail, age, firstName, lastName, licenseNo, appointment } =
    data;
  if (car_detail) {
    $(".g2-submit").text("Edit");
    // $("#g2").removeClass("d-none");
    let { make, model, year, platNo } = car_detail;
    let data = {
      age,
      firstName,
      licenseNo,
      lastName,
      make,
      model,
      year,
      appointment: appointment?._id,
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
          testType: isG2 ? "G2" : "G",
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
