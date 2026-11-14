const bcrypt = require("bcryptjs");
const { getPool, send, getUser, clearSessionCookie, onlyMethod, publicAuthError } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (!onlyMethod(req, res, "POST")) return;
  const user = getUser(req);
  if (!user) return send(res, 401, { error: "Sua sessão expirou. Entre novamente." });

  const senha = String(req.body?.senha || "");
  const confirmacao = String(req.body?.confirmacao || "");
  if (!senha) return send(res, 400, { error: "Informe sua senha atual para confirmar." });
  if (confirmacao !== "EXCLUIR") return send(res, 400, { error: "Confirmação inválida. Digite EXCLUIR." });

  let connection;
  try {
    const db = getPool();
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      "SELECT id, senha_hash FROM astro_usuarios WHERE id = ? LIMIT 1",
      [user.id]
    );
    if (!rows.length) return send(res, 404, { error: "Esta conta não foi encontrada." });
    const senhaValida = await bcrypt.compare(senha, rows[0].senha_hash);
    if (!senhaValida) return send(res, 403, { error: "A senha informada está incorreta." });

    await connection.beginTransaction();
    // Apaga somente dados vinculados ao usuário autenticado.
    await connection.execute("DELETE FROM astro_devolucoes_caixas WHERE usuario_id = ?", [user.id]);
    await connection.execute("DELETE FROM astro_configuracoes WHERE usuario_id = ?", [user.id]);
    await connection.execute("DELETE FROM astro_usuarios WHERE id = ?", [user.id]);
    await connection.commit();

    clearSessionCookie(res);
    return send(res, 200, { success: true, message: "Conta excluída com sucesso." });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    const failure = publicAuthError(error, "excluir a conta");
    return send(res, failure.status, { error: failure.error });
  } finally {
    if (connection) connection.release();
  }
};
