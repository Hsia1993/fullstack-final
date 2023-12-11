const fs = require("fs");

const DIR = `${__dirname}/controllers`;

//Add prefix for restful api endpoint
const URLPREFIX = "/api";

const parseMethodAndURL = (str) => {
  if (!/^\[(POST|GET|DELETE|PUT)\].+/.test(str)) {
    throw "Wrong controller name";
  }
  const [part1, ...part2] = str.split("]");
  return {
    method: part1.substring(1),
    url: `${URLPREFIX}${part2.join("]").trim()}`,
  };
};

module.exports = (app) => {
  const files = fs.readdirSync(DIR);
  files
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const obj = require(`${DIR}/${file}`);
      Object.keys(obj).forEach((key) => {
        const { method, url } = parseMethodAndURL(key);
        console.log(`registered: ${method}: ${url}`);
        app[method.toLowerCase()](url, obj[key]);
      });
    });
};
