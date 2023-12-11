const viewConfig = require("./viewConfig.json");

const getDefualtRoute = (userType) => {
  for (let i = 0; i < viewConfig.length; i++) {
    let { roles, url } = viewConfig[i];
    if (!roles || roles.indexOf(userType) > -1) {
      return url;
    }
  }
};

module.exports = (app) => {
  viewConfig.forEach(({ title, file, url, layout, roles }) => {
    app.get(url, (req, res) => {
      const userType = req.session.userType || "none";
      if (!roles || roles.indexOf(userType) > -1) {
        res.render(layout || "layouts/base", {
          content: `${__dirname}/pages/${file}`,
          title,
          logged: !!req.session.username,
          userType: req.session.userType,
        });
      } else {
        res.redirect(getDefualtRoute(userType));
      }
    });
  });
};
