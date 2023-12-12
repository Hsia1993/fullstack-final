"use strict";
const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

$(document).ready(async () => {
  let rateList = [];
  let historyList = [];
  const fetchAppointments = async () => {
    const resp = await fetch("/api/appointments");
    const { data } = await resp.json();
    rateList = data.filter(({ driver, examiner }) => !!driver && !examiner);
    historyList = data.filter(({ driver, examiner }) => !!driver && !!examiner);
    renderList(rateColumns, rateList);
  };
  fetchAppointments();
  let editId = "";
  $("#rate-submit").click(() => {
    $("#rate").submit();
  });
  onFormSubmit({
    formId: "rate",
    validators: ({ required }) => ({
      passed: [required],
      comment: [required],
    }),
    onSubmit: (data) => {
      const { passed, comment } = data;
      console.log(editId);
      $.ajax({
        url: `/api/appointment/${editId}`,
        method: "put",
        contentType: "application/json",
        data: JSON.stringify({ passed: passed == "Success", comment }),
        success: (resp) => {
          $("#rateModal").hide();
          $(".modal-backdrop").hide();
          fetchAppointments();
        },
      }).fail(function (xhr) {
        $("#rate").after(`
            <div class="alert alert-danger mt-5 form-result" role="alert">
              Failed
            </div>
        `);
      });
    },
  });
  const columnRenders = {
    name: ({ driver }) => `${driver.lastName} ${driver.firstName}`,
    car: ({
      driver: {
        car_detail: { make, model, year },
      },
    }) => `${year} ${make} ${model}`,
    plate: ({
      driver: {
        car_detail: { platNo },
      },
    }) => platNo,
    passed: ({ passed }) => (passed ? "YES" : "NO"),

    "test Type": ({ testType }) => testType,
    comment: ({ comment }) => comment,
    action: ({ _id }) =>
      `<button class="btn btn-primary rate-btn btn-sm" type="button" data-id="${_id}"  data-toggle="modal" data-target="#rateModal">Rate</button>`,
    // date: (_, {start,end}) =>
  };
  const rateColumns = ["name", "car", "test Type", "plate", "action"].map(
    (key) => ({
      title: capitalize(key),
      render: columnRenders[key],
    })
  );
  const historyColumn = [
    "name",
    "car",
    "test Type",
    "plate",
    "passed",
    "comment",
  ].map((key) => ({
    title: capitalize(key),
    render: columnRenders[key],
  }));
  const renderList = (columns, data) => {
    $("#exam-table").html(
      `
        <thead><tr>${columns
          .map((c) => `<th>${c.title}</th>`)
          .join("")}</tr></thead>
        <tbody>
          ${data.map(
            (d) => `
            <tr>
              ${columns.map(({ render }) => `<td>${render(d)}</td>`)}
            </tr>
          `
          )}
        </tbody>
      `
    );
  };
  $(document).on("click", ".rate-btn", function () {
    editId = $(this).data("id");
  });
  $(".nav-link").click(function () {
    const tab = $(this).data("tab");
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
    if (tab == "current") {
      renderList(rateColumns, rateList);
    } else {
      renderList(historyColumn, historyList);
    }
  });
});
