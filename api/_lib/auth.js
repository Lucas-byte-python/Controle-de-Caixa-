const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

let pool;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
  let config;

  if (connectionString) {
    let url;
    try {
      url = new URL(connectionString);
    } catch {
      throw new Error("MYSQL_URL_INVALID");
    }
    config = {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    };
  } else {
    config = {
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    };
  }

  if (!config.host || !config.user || !config.password || !config.database) {
    throw new Error("MYSQL_NOT_CONFIGURED");
  }

  if (process.env.MYSQL_SSL === "true" || (process.env.VERCEL && process.env.MYSQL_SSL !== "false")) {
    config.ssl = { rejectUnauthorized: true };
  }

  pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    charset: "utf8mb4",
  });

  return pool;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  const item = header.split(";").map(part => part.trim()).find(part => part.startsWith(name + "="));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

function setSessionCookie(res, token, maxAge = 7 * 24 * 60 * 60) {
  const secure = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    "astro_session=" + encodeURIComponent(token),
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=" + maxAge,
    secure ? "Secure" : "",
  ].filter(Boolean).join("; "));
}

function createSession(user) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET_MISSING");
  }
  return jwt.sign(
    { sub: String(user.id), email: user.email, nome: user.nome },
    secret,
    { expiresIn: "7d", issuer: "astro-controle-caixas" }
  );
}

function getUser(req) {
  try {
    const token = readCookie(req, "astro_session");
    if (!token || !process.env.SESSION_SECRET) return null;
    const payload = jwt.verify(token, process.env.SESSION_SECRET, { issuer: "astro-controle-caixas" });
    return { id: Number(payload.sub), email: payload.email, nome: payload.nome };
  } catch {
    return null;
  }
}

function clearSessionCookie(res) {
  const secure = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    "astro_session=",
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    secure ? "Secure" : "",
  ].filter(Boolean).join("; "));
}

function onlyMethod(req, res, method) {
  if (req.method !== method) {
    res.setHeader("Allow", method);
    send(res, 405, { error: "Método não permitido." });
    return false;
  }
  return true;
}

function publicAuthError(error, action = "concluir a operação") {
  const code = error && error.message;
  if (code === "MYSQL_NOT_CONFIGURED") {
    return { status: 503, error: "O banco de dados ainda não está configurado na Vercel. Configure as variáveis MYSQL_* em Settings → Environment Variables." };
  }
  if (code === "MYSQL_URL_INVALID") {
    return { status: 503, error: "A variável MYSQL_URL está em formato inválido. Confira a conexão do banco nas configurações da Vercel." };
  }
  if (code === "SESSION_SECRET_MISSING") {
    return { status: 503, error: "Falta configurar SESSION_SECRET na Vercel. Crie uma chave aleatória com pelo menos 32 caracteres e publique novamente." };
  }
  if (error && (error.code === "ER_NO_SUCH_TABLE" || error.code === "ER_BAD_FIELD_ERROR")) {
    return { status: 503, error: "As tabelas do sistema ainda não foram criadas. Execute o arquivo database/schema.sql no seu banco MySQL." };
  }
  if (error && error.code === "ER_ACCESS_DENIED_ERROR") {
    return { status: 503, error: "O MySQL recusou o acesso. Confira usuário e senha nas variáveis da Vercel." };
  }
  if (error && (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT" || error.code === "CERT_HAS_EXPIRED")) {
    return { status: 503, error: "Não foi possível conectar ao MySQL. Confira host, porta, SSL e permissões de conexão do banco." };
  }
  console.error("Falha de autenticação ao " + action + ":", error);
  return { status: 500, error: "Ocorreu um erro no servidor ao " + action + ". Consulte os logs de Functions na Vercel." };
}

module.exports = { getPool, send, createSession, getUser, setSessionCookie, clearSessionCookie, onlyMethod, publicAuthError };
