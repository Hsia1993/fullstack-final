$(document).ready(async function () {
  const fetchAppointments = async () => {
    const resp = await fetch("/api/appointments/self");
    return await resp.json();
  };
  const appointments = await fetchAppointments();
  const appointmentMap = appointments.data.reduce(
    (acc, { start, isAvailable }) => {
      acc[start] = { isAvailable };
      return acc;
    },
    {}
  );
  initializeWeekSelector();
  updateTimetable();
  function getStatus(startStr) {
    if (appointmentMap[startStr]) {
      return appointmentMap[startStr].isAvailable ? "created" : "used";
    }
    return "idle";
  }

  function initializeWeekSelector() {
    const weekSelector = $("#weekSelector");

    for (let offset = 0; offset < 4; offset++) {
      const date = moment().add(offset, "w");
      const year = date.year();
      const week = date.week();
      const optionValue = `${year}-W${week}`;
      const optionText = `Week ${week}(${date
        .startOf("week")
        .format("DD/MM")}-${date.endOf("week").format("DD/MM")}), ${year}`;
      weekSelector.append($("<option>").val(optionValue).text(optionText));
    }

    const currentWeek = `${moment().year()}-W${moment().week()}`;
    weekSelector.val(currentWeek);
    weekSelector.on("change", (e) => {
      updateTimetable(e.currentTarget.value);
    });
  }

  function updateTimetable(selectedDate) {
    // Clear existing timetable
    $("#timetable-body").empty();

    // Get the start date of the selected week or use the current date
    const startDate = selectedDate ? moment(selectedDate) : moment();
    startDate.startOf("week");

    // Loop through each time slot (you can customize this based on your needs)
    for (let i = 9; i <= 17; i++) {
      const row = $("<tr>");
      row.append(
        $("<td style='white-space: nowrap'>").text(`${i}:00-${i + 1}:00`)
      );

      // Create cells for each day of the week
      for (let j = 0; j < 5; j++) {
        const cell = $("<td>");
        const start = startDate
          .clone()
          .day(j + 1)
          .add(i, "h");

        const end = start.clone().add(1, "h");
        const startStr = start.toISOString();
        const endStr = end.toISOString();
        const status = getStatus(startStr);
        const statusToClass = {
          idle: "btn-success",
          used: "btn-secondary",
          created: "btn-primary",
        };
        const statusToText = {
          idle: "Idle",
          used: "Reserved",
          created: "Active",
        };
        const appointmentBtn = $("<button>")
          .addClass(`btn ${statusToClass[status]} btn-sm`)
          .text(statusToText[status]);

        // Attach click event to the appointment button
        appointmentBtn.click(function async() {
          if (status !== "idle") return;
          $.ajax({
            url: `/api/appointment`,
            method: "post",
            contentType: "application/json",
            data: JSON.stringify({
              start: startStr,
              end: endStr,
            }),
            success: (resp) => {
              appointmentMap[startStr] = { isAvailable: true };
              updateTimetable($("#weekSelector").val());
            },
          }).fail(function (xhr) {});
        });

        cell.append(appointmentBtn);
        row.append(cell);
      }
      $("#timetable-body").append(row);
    }
  }
});
