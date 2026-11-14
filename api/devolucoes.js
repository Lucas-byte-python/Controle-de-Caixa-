const { getPool, send, getUser, onlyMethod, publicAuthError } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  const user = getUser(req);
  if (!user) return send(res, 401, { error: "Sua sessão expirou. Entre novamente no sistema." });

  try {
    const db = getPool();

    if (req.method === "GET") {
      const id = req.query?.id ? Number(req.query.id) : null;
      if (id) {
        if (!Number.isSafeInteger(id) || id < 1) return send(res, 400, { error: "Identificador inválido." });
        const [rows] = await db.execute(
          "SELECT id, foto_data_url, foto_nome FROM astro_devolucoes_caixas WHERE id = ? AND usuario_id = ? LIMIT 1",
          [id, user.id]
        );
        if (!rows.length) return send(res, 404, { error: "Registro não encontrado." });
        if (!rows[0].foto_data_url) return send(res, 404, { error: "Esta devolução foi registrada sem anexo." });
        return send(res, 200, { fotoDataUrl: rows[0].foto_data_url, fotoNome: rows[0].foto_nome });
      }

      const [rows] = await db.execute(
        "SELECT d.id, d.nota_fiscal, d.loja, d.caixa, d.quantidade, d.recebido_em, d.foto_nome, u.nome AS registrado_por FROM astro_devolucoes_caixas d INNER JOIN astro_usuarios u ON u.id = d.usuario_id WHERE d.usuario_id = ? ORDER BY d.recebido_em DESC LIMIT 300",
        [user.id]
      );
      return send(res, 200, { devolucoes: rows });
    }

    if (!onlyMethod(req, res, "POST")) return;
    const notaFiscal = String(req.body?.notaFiscal || "").trim();
    const loja = String(req.body?.loja || "").trim();
    const caixa = String(req.body?.caixa || "").trim();
    const quantidade = Number(req.body?.quantidade);
    const fotoDataUrl = req.body?.fotoDataUrl ? String(req.body.fotoDataUrl) : null;
    const fotoNome = fotoDataUrl ? String(req.body?.fotoNome || "anexo").trim().slice(0, 255) : null;

    if (!notaFiscal || notaFiscal.length > 50) return send(res, 400, { error: "Informe o número da nota fiscal (até 50 caracteres)." });
    if (!loja || loja.length > 120) return send(res, 400, { error: "Informe a loja de origem (até 120 caracteres)." });
    if (!caixa || caixa.length > 120) return send(res, 400, { error: "Selecione o tipo de caixa." });
    if (!Number.isSafeInteger(quantidade) || quantidade < 1 || quantidade > 1000000) return send(res, 400, { error: "Informe uma quantidade válida." });
    if (fotoDataUrl && (!/^data:(application\/pdf|image\/(jpeg|png|webp));base64,[A-Za-z0-9+/]+=*$/.test(fotoDataUrl) || fotoDataUrl.length > 2_900_000)) {
      return send(res, 400, { error: "O anexo deve ser PDF, JPG, PNG ou WEBP de até 2 MB." });
    }

    await db.execute(
      "INSERT INTO astro_devolucoes_caixas (usuario_id, nota_fiscal, loja, caixa, quantidade, foto_data_url, foto_nome) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [user.id, notaFiscal, loja, caixa, quantidade, fotoDataUrl, fotoNome]
    );
    return send(res, 201, { success: true, message: "Devolução registrada com sucesso." });
  } catch (error) {
    const failure = publicAuthError(error, "registrar ou consultar devoluções");
    return send(res, failure.status, { error: failure.error });
  }
};
