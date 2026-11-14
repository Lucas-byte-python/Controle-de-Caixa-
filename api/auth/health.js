const { getPool, send, onlyMethod, publicAuthError } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (!onlyMethod(req, res, "GET")) return;

  const status = {
    api: true,
    mysqlConfigured: Boolean(
      (process.env.MYSQL_URL || process.env.DATABASE_URL) ||
      (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD && process.env.MYSQL_DATABASE)
    ),
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32),
    mysqlConnected: false,
    tablesReady: false
  };

  try {
    const db = getPool();
    await db.query("SELECT 1");
    status.mysqlConnected = true;

    const [tables] = await db.execute(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('astro_usuarios', 'astro_configuracoes', 'astro_devolucoes_caixas')"
    );
    const names = new Set(tables.map(row => row.TABLE_NAME));
    status.tablesReady = names.has("astro_usuarios") && names.has("astro_configuracoes") && names.has("astro_devolucoes_caixas");
    status.ready = status.mysqlConnected && status.tablesReady && status.sessionSecretConfigured;

    if (!status.tablesReady) {
      return send(res, 503, {
        ...status,
        message: "Conexão MySQL ativa, mas as tabelas ainda não existem. Execute database/schema.sql."
      });
    }
    if (!status.sessionSecretConfigured) {
      return send(res, 503, {
        ...status,
        message: "Configure SESSION_SECRET com pelo menos 32 caracteres na Vercel."
      });
    }
    return send(res, 200, { ...status, ready: true, message: "Autenticação configurada." });
  } catch (error) {
    const failure = publicAuthError(error, "verificar o banco de dados");
    return send(res, failure.status, {
      ...status,
      ready: false,
      message: failure.error
    });
  }
};
