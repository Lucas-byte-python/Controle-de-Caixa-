const { send, getUser, onlyMethod } = require("../_lib/auth");

module.exports = function handler(req, res) {
  if (!onlyMethod(req, res, "GET")) return;
  const user = getUser(req);
  if (!user) return send(res, 401, { authenticated: false });
  return send(res, 200, { authenticated: true, user });
};
