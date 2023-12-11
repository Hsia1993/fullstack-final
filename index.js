const express = require("express");
const db = require("./db");
const initView = require("./views/initView");
const bootControllers = require("./bootControllers");
const session = require("express-session");
const init = async () => {
  try {
    await db();
    const app = new express();
    app.use(express.json());
    app.use(
      session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
      })
    );
    app.use(express.urlencoded());
    app.use(express.static("public"));
    app.set("view engine", "ejs");
    //render page by config in pageConfig file, use base layout by default
    initView(app);
    //boot api controllers
    bootControllers(app);
    // listen 4000 port
    app.listen(4000, () => {
      console.log("App listening on port 4000 : http//localhost:4000");
    });
  } catch (e) {
    console.log(e);
  }
};

init();
