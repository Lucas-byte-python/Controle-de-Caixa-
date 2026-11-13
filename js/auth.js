const USERS_KEY="astroUsuarios";
const SESSION_KEY="astroSessao";
const $=id=>document.getElementById(id);
$("year").textContent=new Date().getFullYear();
if(localStorage.getItem(SESSION_KEY)==="ativa"){window.location.replace("/html/load.html");}
function alternarModo(modo){
 const cadastro=modo==="cadastro";
 $("loginForm").classList.toggle("hidden",cadastro);
 $("registerForm").classList.toggle("hidden",!cadastro);
 $("tabLogin").classList.toggle("active",!cadastro);
 $("tabCadastro").classList.toggle("active",cadastro);
 $("formKicker").textContent=cadastro?"NOVO ACESSO":"ÁREA RESTRITA";
 $("formTitle").textContent=cadastro?"Crie sua conta":"Bem-vindo de volta";
 $("formDescription").textContent=cadastro?"Preencha os dados para cadastrar seu acesso.":"Entre com seus dados para acessar o sistema.";
 $("loginMessage").textContent="";$("registerMessage").textContent="";
}
$("tabLogin").addEventListener("click",()=>alternarModo("login"));
$("tabCadastro").addEventListener("click",()=>alternarModo("cadastro"));
document.querySelectorAll(".show-password").forEach(button=>button.addEventListener("click",()=>{
 const campo=$(button.dataset.target);campo.type=campo.type==="password"?"text":"password";
}));
function usuarios(){try{return JSON.parse(localStorage.getItem(USERS_KEY))||[]}catch{return[]}}
async function hashSenha(senha,salt){
 const dados=new TextEncoder().encode(salt+senha);
 const digest=await crypto.subtle.digest("SHA-256",dados);
 return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function mensagem(id,texto,tipo=""){const el=$(id);el.textContent=texto;el.className="form-message "+tipo}
$("registerForm").addEventListener("submit",async event=>{
 event.preventDefault();
 const nome=$("registerName").value.trim(),email=$("registerEmail").value.trim().toLowerCase();
 const senha=$("registerPassword").value,confirmacao=$("confirmPassword").value;
 if(nome.length<3){mensagem("registerMessage","Informe seu nome completo.");return}
 if(senha.length<8){mensagem("registerMessage","A senha precisa ter pelo menos 8 caracteres.");return}
 if(senha!==confirmacao){mensagem("registerMessage","As senhas não coincidem.");return}
 const lista=usuarios();
 if(lista.some(u=>u.email===email)){mensagem("registerMessage","Este e-mail já possui cadastro. Faça login.");return}
 const salt=crypto.randomUUID();
 const passwordHash=await hashSenha(senha,salt);
 lista.push({nome,email,salt,passwordHash,criadoEm:new Date().toISOString()});
 localStorage.setItem(USERS_KEY,JSON.stringify(lista));
 $("registerForm").reset();
 alternarModo("login");
 $("loginEmail").value=email;
 mensagem("loginMessage","Cadastro realizado! Agora entre com seu e-mail e senha.","success");
});
$("loginForm").addEventListener("submit",async event=>{
 event.preventDefault();
 const email=$("loginEmail").value.trim().toLowerCase(),senha=$("loginPassword").value;
 const usuario=usuarios().find(u=>u.email===email);
 if(!usuario){mensagem("loginMessage","Conta não encontrada. Confira os dados ou crie uma conta.");return}
 const tentativa=await hashSenha(senha,usuario.salt);
 if(tentativa!==usuario.passwordHash){mensagem("loginMessage","E-mail ou senha incorretos.");return}
 localStorage.setItem(SESSION_KEY,"ativa");
 sessionStorage.setItem("astroNomeUsuario",usuario.nome);
 mensagem("loginMessage","Acesso autorizado. Preparando o sistema...","success");
 setTimeout(()=>window.location.replace("/html/load.html"),450);
});
