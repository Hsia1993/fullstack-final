const userModel = require("../models/user");
const appointmentModel = require("../models/appointment");

const updateAppointAvaliablity = async (preId, nextId, userId, testType) => {
  if (nextId !== preId) {
    await appointmentModel.findByIdAndUpdate(nextId, {
      isAvailable: false,
      driver: userId,
      testType,
    });
  }
  if (preId) {
    await appointmentModel.findByIdAndUpdate(preId, {
      isAvailable: true,
      driver: null,
      testType: null,
    });
  }
};

const bcrypt = require("bcrypt");

const saveUser = async (req, res) => {
  try {
    const data = await userModel.create(req.body);
    res.status(200).send({ data });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const queryUser = async (req, res) => {
  try {
    const data = await userModel.findOne(req.query);
    res.status(200).send({ data });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const updateUser = async (req, res) => {
  const session = await userModel.startSession();
  session.startTransaction();
  try {
    const preData = await userModel
      .findById(req.params.id)
      .populate("appointment");
    if (preData.appointment && preData.appointment.examiner) {
      throw "Can not change finished appointment";
    }
    await updateAppointAvaliablity(
      preData.appointment,
      req.body.appointment,
      req.session.userId,
      req.body.testType
    );
    const data = await userModel.findByIdAndUpdate(req.params.id, req.body);
    await session.commitTransaction();
    session.endSession();
    res.status(200).send({ data });
  } catch (e) {
    console.log(e);
    await session.commitTransaction();
    session.endSession();
    res.status(400).send({ msg: e.message });
  }
};
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await userModel.findOne({ username });
    if (data) {
      const same = await bcrypt.compare(password, data.password);
      if (same) {
        req.session.username = username;
        req.session.userId = data._id;
        req.session.userType = data.userType;
        res.status(200).send({ data: { username } });
      } else {
        throw "";
      }
    } else {
      throw "";
    }
  } catch (e) {
    res.status(400).send({ msg: "Username do not exist or wrong password" });
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (e) {
    res.redirect("/");
  }
};
const getSelf = async (req, res) => {
  try {
    const data = await userModel
      .findById(req.session.userId)
      .populate("appointment");
    res.status(200).send({ data });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const reschedule = async (req, res) => {
  try {
    const data = await userModel.findByIdAndUpdate(req.session.userId, {
      appointment: null,
    });
    res.status(200).send({ data });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const scheduleG = async (req, res) => {
  try {
    const data = await userModel.findByIdAndUpdate(req.session.userId, {
      testType: "G",
      appointment: null,
    });
    res.status(200).send({ data });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

module.exports = {
  "[POST] /user": saveUser,
  "[GET] /user": queryUser,
  "[POST] /login": login,
  "[POST] /signup": saveUser,
  "[GET] /logout": logout,
  "[GET] /self": getSelf,
  "[PUT] /user/appointment": reschedule,
  "[PUT] /user/appointment/g": scheduleG,
  "[PUT] /user/:id": updateUser,
};
