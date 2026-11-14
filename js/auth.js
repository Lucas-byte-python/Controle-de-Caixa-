const $ = id => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

function mensagem(id, texto, tipo = "") {
  const elemento = $(id);
  elemento.textContent = texto;
  elemento.className = "form-message " + tipo;
}

function alternarModo(modo) {
  const cadastro = modo === "cadastro";
  $("loginForm").classList.toggle("hidden", cadastro);
  $("registerForm").classList.toggle("hidden", !cadastro);
  $("tabLogin").classList.toggle("active", !cadastro);
  $("tabCadastro").classList.toggle("active", cadastro);
  $("formKicker").textContent = cadastro ? "NOVO ACESSO" : "ÁREA RESTRITA";
  $("formTitle").textContent = cadastro ? "Crie sua conta" : "Bem-vindo de volta";
  $("formDescription").textContent = cadastro
    ? "Preencha os dados para cadastrar seu acesso."
    : "Entre com seus dados para acessar o sistema.";
  mensagem("loginMessage", "");
  mensagem("registerMessage", "");
}

$("tabLogin").addEventListener("click", () => alternarModo("login"));
$("tabCadastro").addEventListener("click", () => alternarModo("cadastro"));

document.querySelectorAll(".show-password").forEach(button => {
  button.addEventListener("click", () => {
    const campo = $(button.dataset.target);
    campo.type = campo.type === "password" ? "text" : "password";
  });
});

async function chamarApi(url, dados) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(dados)
  });
  const resultado = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(resultado.error || "Não foi possível concluir a operação.");
  return resultado;
}

$("registerForm").addEventListener("submit", async event => {
  event.preventDefault();

  const nome = $("registerName").value.trim();
  const email = $("registerEmail").value.trim().toLowerCase();
  const senha = $("registerPassword").value;
  const confirmacao = $("confirmPassword").value;

  if (nome.length < 3) {
    mensagem("registerMessage", "Informe seu nome completo.");
    return;
  }
  if (senha.length < 8) {
    mensagem("registerMessage", "A senha precisa ter pelo menos 8 caracteres.");
    return;
  }
  if (senha !== confirmacao) {
    mensagem("registerMessage", "As senhas não coincidem.");
    return;
  }

  const botao = $("registerForm").querySelector('button[type="submit"]');
  botao.disabled = true;
  botao.textContent = "Cadastrando...";

  try {
    await chamarApi("/api/auth/register", { nome, email, senha });
    $("registerForm").reset();
    alternarModo("login");
    $("loginEmail").value = email;
    mensagem("loginMessage", "Cadastro realizado! Agora entre com seu e-mail e senha.", "success");
  } catch (error) {
    mensagem("registerMessage", error.message);
  } finally {
    botao.disabled = false;
    botao.innerHTML = 'Cadastrar conta <span>→</span>';
  }
});

$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("loginEmail").value.trim().toLowerCase();
  const senha = $("loginPassword").value;
  const botao = $("loginForm").querySelector('button[type="submit"]');

  botao.disabled = true;
  botao.textContent = "Verificando acesso...";

  try {
    await chamarApi("/api/auth/login", { email, senha });
    mensagem("loginMessage", "Acesso autorizado. Preparando o sistema...", "success");
    setTimeout(() => window.location.replace("/html/load.html"), 350);
  } catch (error) {
    mensagem("loginMessage", error.message);
    botao.disabled = false;
    botao.innerHTML = 'Acessar sistema <span>→</span>';
  }
});

(async function verificarSessaoExistente() {
  try {
    const resposta = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
    if (resposta.ok) window.location.replace("/html/load.html");
  } catch (error) {
    console.warn("Não foi possível verificar a sessão agora.", error);
  }
})();
