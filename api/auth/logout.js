const { send, clearSessionCookie, onlyMethod } = require("../_lib/auth");

module.exports = function handler(req, res) {
  if (!onlyMethod(req, res, "POST")) return;
  clearSessionCookie(res);
  return send(res, 200, { success: true });
};
