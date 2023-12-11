const appointmentModal = require("../models/appointment");
const createAppointment = async (req, res) => {
  try {
    const data = await appointmentModal.create({
      ...req.body,
      creator: req.session.userId,
      isAvailable: true,
    });
    res.status(200).send(data);
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const queryAppointments = async (req, res) => {
  try {
    const data = await appointmentModal.find(req.query);
    res.status(200).send({ data });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const getMyAppointments = async (req, res) => {
  req.query = {
    creator: req.session.userId,
  };
  queryAppointments(req, res);
};
const deleteAppointment = async (req, res) => {
  try {
    const data = await appointmentModal.findByIdAndDelete(req.params.id);
    res.status(200).send({ data });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

module.exports = {
  "[POST] /appointment": createAppointment,
  "[GET] /appointments": queryAppointments,
  "[GET] /appointments/self": getMyAppointments,
  "[DELETE] /appointment/:id": deleteAppointment,
};
