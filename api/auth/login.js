const bcrypt = require("bcryptjs");
const { getPool, send, createSession, setSessionCookie, onlyMethod } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (!onlyMethod(req, res, "POST")) return;

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const senha = String(req.body?.senha || "");

    if (!email || !senha) return send(res, 400, { error: "Informe e-mail e senha." });

    const db = getPool();
    const [rows] = await db.execute(
      "SELECT id, nome, email, senha_hash FROM astro_usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows.length || !(await bcrypt.compare(senha, rows[0].senha_hash))) {
      return send(res, 401, { error: "E-mail ou senha incorretos." });
    }

    const user = { id: rows[0].id, nome: rows[0].nome, email: rows[0].email };
    const token = createSession(user);
    setSessionCookie(res, token);

    return send(res, 200, { success: true, user });
  } catch (error) {
    console.error("Erro no login:", error);
    return send(res, 500, { error: "Não foi possível entrar. Confira a conexão com o banco." });
  }
};
