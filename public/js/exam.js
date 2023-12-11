"use strict";

$(document).ready(() => {
  const fetchAppointments = async () => {
    const resp = await fetch("/api/appointments");
    return await resp.json();
  };
  fetchAppointments();
});
