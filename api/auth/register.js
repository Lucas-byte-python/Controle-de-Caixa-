const bcrypt = require("bcryptjs");
const { getPool, send, onlyMethod } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (!onlyMethod(req, res, "POST")) return;

  try {
    const nome = String(req.body?.nome || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const senha = String(req.body?.senha || "");

    if (nome.length < 3 || nome.length > 80) {
      return send(res, 400, { error: "Informe um nome entre 3 e 80 caracteres." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
      return send(res, 400, { error: "Informe um e-mail válido." });
    }
    if (senha.length < 8 || senha.length > 72) {
      return send(res, 400, { error: "A senha deve ter entre 8 e 72 caracteres." });
    }

    const db = getPool();
    const senhaHash = await bcrypt.hash(senha, 12);

    try {
      const [result] = await db.execute(
        "INSERT INTO astro_usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
        [nome, email, senhaHash]
      );
      await db.execute(
        "INSERT INTO astro_configuracoes (usuario_id, configuracoes) VALUES (?, JSON_OBJECT())",
        [result.insertId]
      );
      return send(res, 201, { success: true, message: "Cadastro realizado. Agora entre com seu e-mail e senha." });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return send(res, 409, { error: "Este e-mail já possui cadastro. Faça login." });
      }
      throw error;
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return send(res, 500, { error: "Não foi possível concluir o cadastro. Confira a conexão com o banco." });
  }
};
