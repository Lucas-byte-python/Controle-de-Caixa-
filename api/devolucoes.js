const { getPool, send, getUser, onlyMethod, publicAuthError } = require("./_lib/auth");

function validarAnexo(fotoDataUrl) {
  return !fotoDataUrl || (
    /^data:(application\/pdf|image\/(jpeg|png|webp));base64,[A-Za-z0-9+/]+=*$/.test(fotoDataUrl) &&
    fotoDataUrl.length <= 2_900_000
  );
}

function validarCampos(body) {
  const notaFiscal = String(body?.notaFiscal || "").trim();
  const loja = String(body?.loja || "").trim();
  const caixa = String(body?.caixa || "").trim();
  const quantidade = Number(body?.quantidade);
  const fotoDataUrl = body?.fotoDataUrl ? String(body.fotoDataUrl) : null;
  const fotoNome = fotoDataUrl ? String(body?.fotoNome || "anexo").trim().slice(0, 255) : null;

  if (!notaFiscal || notaFiscal.length > 50) return { error: "Informe o número da nota fiscal (até 50 caracteres)." };
  if (!loja || loja.length > 120) return { error: "Informe a loja de origem (até 120 caracteres)." };
  if (!caixa || caixa.length > 120) return { error: "Selecione o tipo de caixa." };
  if (!Number.isSafeInteger(quantidade) || quantidade < 1 || quantidade > 1000000) return { error: "Informe uma quantidade válida." };
  if (!validarAnexo(fotoDataUrl)) return { error: "O anexo deve ser PDF, JPG, PNG ou WEBP de até 2 MB." };
  return { notaFiscal, loja, caixa, quantidade, fotoDataUrl, fotoNome };
}

module.exports = async function handler(req, res) {
  const user = getUser(req);
  if (!user) return send(res, 401, { error: "Sua sessão expirou. Entre novamente no sistema." });

  try {
    const db = getPool();

    if (req.method === "GET") {
      const historicoId = req.query?.historico ? Number(req.query.historico) : null;
      if (historicoId) {
        if (!Number.isSafeInteger(historicoId) || historicoId < 1) return send(res, 400, { error: "Identificador inválido." });
        const [owned] = await db.execute(
          "SELECT id FROM astro_devolucoes_caixas WHERE id = ? AND usuario_id = ? LIMIT 1",
          [historicoId, user.id]
        );
        if (!owned.length) return send(res, 404, { error: "Registro não encontrado." });
        const [logs] = await db.execute(
          "SELECT h.acao, h.detalhes, h.criado_em, u.nome AS realizado_por FROM astro_devolucoes_auditoria h INNER JOIN astro_usuarios u ON u.id = h.usuario_id WHERE h.devolucao_id = ? ORDER BY h.criado_em DESC LIMIT 50",
          [historicoId]
        );
        return send(res, 200, { historico: logs });
      }

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
        "SELECT d.id, d.nota_fiscal, d.loja, d.caixa, d.quantidade, d.recebido_em, d.foto_nome, u.nome AS registrado_por, COALESCE(c.cancelada, 0) AS cancelada, c.alterado_em, ua.nome AS alterado_por FROM astro_devolucoes_caixas d INNER JOIN astro_usuarios u ON u.id = d.usuario_id LEFT JOIN astro_devolucoes_controle c ON c.devolucao_id = d.id LEFT JOIN astro_usuarios ua ON ua.id = c.alterado_por WHERE d.usuario_id = ? ORDER BY d.recebido_em DESC LIMIT 300",
        [user.id]
      );
      return send(res, 200, { devolucoes: rows });
    }

    if (!onlyMethod(req, res, "POST")) return;
    const acao = String(req.body?.acao || "criar");

    if (acao === "cancelar" || acao === "editar") {
      const id = Number(req.body?.id);
      if (!Number.isSafeInteger(id) || id < 1) return send(res, 400, { error: "Identificador inválido." });

      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(
          "SELECT id, nota_fiscal, loja, caixa, quantidade, foto_nome FROM astro_devolucoes_caixas WHERE id = ? AND usuario_id = ? FOR UPDATE",
          [id, user.id]
        );
        if (!rows.length) {
          await connection.rollback();
          return send(res, 404, { error: "Devolução não encontrada ou sem permissão para alterá-la." });
        }
        const atual = rows[0];
        const [controles] = await connection.execute(
          "SELECT cancelada FROM astro_devolucoes_controle WHERE devolucao_id = ? FOR UPDATE",
          [id]
        );
        if (Number(controles[0]?.cancelada || 0) === 1) {
          await connection.rollback();
          return send(res, 409, { error: "Esta devolução já foi cancelada e não pode ser alterada." });
        }

        await connection.execute(
          "INSERT INTO astro_devolucoes_auditoria (devolucao_id, usuario_id, acao, detalhes) VALUES (?, ?, ?, ?)",
          [id, user.id, acao === "cancelar" ? "CANCELAMENTO" : "ANTES_DA_ALTERACAO", JSON.stringify(atual)]
        );

        if (acao === "cancelar") {
          await connection.execute(
            "INSERT INTO astro_devolucoes_controle (devolucao_id, cancelada, alterado_em, alterado_por) VALUES (?, 1, CURRENT_TIMESTAMP, ?) ON DUPLICATE KEY UPDATE cancelada = 1, alterado_em = CURRENT_TIMESTAMP, alterado_por = VALUES(alterado_por)",
            [id, user.id]
          );
          await connection.execute(
            "INSERT INTO astro_devolucoes_auditoria (devolucao_id, usuario_id, acao, detalhes) VALUES (?, ?, 'DEVOLUCAO_CANCELADA', ?)",
            [id, user.id, JSON.stringify({ motivo: String(req.body?.motivo || "Cancelada pelo usuário").slice(0, 500), registro: atual })]
          );
          await connection.commit();
          return send(res, 200, { success: true, message: "Devolução cancelada. A quantidade não contará mais no estoque." });
        }

        const campos = validarCampos(req.body);
        if (campos.error) {
          await connection.rollback();
          return send(res, 400, { error: campos.error });
        }
        const substituirFoto = Boolean(campos.fotoDataUrl);
        if (substituirFoto) {
          await connection.execute(
            "UPDATE astro_devolucoes_caixas SET nota_fiscal = ?, loja = ?, caixa = ?, quantidade = ?, foto_data_url = ?, foto_nome = ? WHERE id = ? AND usuario_id = ?",
            [campos.notaFiscal, campos.loja, campos.caixa, campos.quantidade, campos.fotoDataUrl, campos.fotoNome, id, user.id]
          );
        } else {
          await connection.execute(
            "UPDATE astro_devolucoes_caixas SET nota_fiscal = ?, loja = ?, caixa = ?, quantidade = ? WHERE id = ? AND usuario_id = ?",
            [campos.notaFiscal, campos.loja, campos.caixa, campos.quantidade, id, user.id]
          );
        }
        await connection.execute(
          "INSERT INTO astro_devolucoes_controle (devolucao_id, cancelada, alterado_em, alterado_por) VALUES (?, 0, CURRENT_TIMESTAMP, ?) ON DUPLICATE KEY UPDATE alterado_em = CURRENT_TIMESTAMP, alterado_por = VALUES(alterado_por)",
          [id, user.id]
        );
        await connection.execute(
          "INSERT INTO astro_devolucoes_auditoria (devolucao_id, usuario_id, acao, detalhes) VALUES (?, ?, 'ALTERACAO_REALIZADA', ?)",
          [id, user.id, JSON.stringify({ antes: atual, depois: campos })]
        );
        await connection.commit();
        return send(res, 200, { success: true, message: "Devolução atualizada com sucesso." });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    const campos = validarCampos(req.body);
    if (campos.error) return send(res, 400, { error: campos.error });

    const [result] = await db.execute(
      "INSERT INTO astro_devolucoes_caixas (usuario_id, nota_fiscal, loja, caixa, quantidade, foto_data_url, foto_nome) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [user.id, campos.notaFiscal, campos.loja, campos.caixa, campos.quantidade, campos.fotoDataUrl, campos.fotoNome]
    );
    await db.execute(
      "INSERT INTO astro_devolucoes_controle (devolucao_id, cancelada) VALUES (?, 0)",
      [result.insertId]
    );
    await db.execute(
      "INSERT INTO astro_devolucoes_auditoria (devolucao_id, usuario_id, acao, detalhes) VALUES (?, ?, 'CRIACAO', ?)",
      [result.insertId, user.id, JSON.stringify({ notaFiscal: campos.notaFiscal, loja: campos.loja, caixa: campos.caixa, quantidade: campos.quantidade })]
    );
    return send(res, 201, { success: true, id: result.insertId, message: "Devolução registrada com sucesso." });
  } catch (error) {
    const failure = publicAuthError(error, "registrar, alterar ou consultar devoluções");
    return send(res, failure.status, { error: failure.error });
  }
};
