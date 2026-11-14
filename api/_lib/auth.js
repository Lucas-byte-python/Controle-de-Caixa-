const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

let pool;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
  let config;

  if (connectionString) {
    const url = new URL(connectionString);
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

  if (!config.host || !config.user || !config.database) {
    throw new Error("Configuração do MySQL incompleta. Confira as variáveis de ambiente.");
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
  const secure = process.env.VERCEL || process.env.NODE_ENV === "production";
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
    throw new Error("SESSION_SECRET precisa ter pelo menos 32 caracteres.");
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
  const secure = process.env.VERCEL || process.env.NODE_ENV === "production";
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

module.exports = { getPool, send, createSession, getUser, setSessionCookie, clearSessionCookie, onlyMethod };
