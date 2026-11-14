# 📦 Controle de Caixas e Paletes — ASTROAGROCOMERCIAL

Sistema web desenvolvido para auxiliar no controle e gerenciamento das movimentações de caixas e paletes da **ASTROAGROCOMERCIAL**, empresa do segmento de distribuição de frutas, verduras e hortifrúti.

O projeto facilita o acompanhamento das entradas e saídas, a organização operacional e a visualização dos saldos e históricos.

---

## 🚀 Funcionalidades

- **Controle de Caixas e Paletes:** registro independente de entradas e saídas.
- **Saldo negativo:** permite registrar saídas acima da quantidade disponível.
- **Histórico:** consulta, edição e exclusão de movimentações.
- **Relatórios:** geração e impressão de relatórios de caixas, paletes ou ambos.
- **Gráficos:** visualização das movimentações.
- **Cadastro e login:** autenticação pela API do Vercel.
- **Senhas protegidas:** armazenamento de hash bcrypt, nunca da senha em texto puro.
- **Sessões:** cookie HttpOnly validado no servidor.
- **Banco MySQL:** armazenamento de contas de usuário e estrutura para configurações individuais.
- **Interface responsiva:** identidade visual corporativa em tons de azul.

---

## 🛠️ Tecnologias

| Tecnologia | Aplicação |
|---|---|
| HTML5 e CSS3 | Estrutura e interface |
| JavaScript | Funcionalidades do sistema |
| Node.js / Vercel Functions | API de autenticação |
| MySQL | Usuários e configurações |
| bcryptjs | Hash seguro das senhas |
| jsonwebtoken | Sessões assinadas |
| mysql2 | Conexão com MySQL |
| Chart.js | Gráficos |
| LocalStorage | Movimentações nesta etapa |

---

## 📂 Estrutura do projeto

```text
Controle-de-Caixa-/
├── api/
│   ├── _lib/auth.js
│   └── auth/
│       ├── register.js
│       ├── login.js
│       ├── me.js
│       └── logout.js
├── database/
│   ├── schema.sql
│   └── SETUP.md
├── html/
│   ├── index.html
│   ├── login.html
│   └── load.html
├── css/
├── js/
│   ├── auth.js
│   └── script.js
├── img/
├── package.json
├── vercel.json
└── README.md
```

---

## 💾 Armazenamento e observações

O cadastro e o login são preparados para usar o MySQL por meio da API hospedada no Vercel. Para ativar a conexão, é necessário criar o banco, executar `database/schema.sql` e cadastrar as variáveis de ambiente descritas em [database/SETUP.md](database/SETUP.md).

**Importante:** nesta etapa, as movimentações de caixas e paletes ainda são armazenadas no LocalStorage do navegador. Portanto, elas não são sincronizadas entre computadores. A migração do histórico e do estoque para o MySQL será uma etapa separada.

---

## 🌐 Acesso

**GitHub:** https://github.com/Lucas-byte-python/Controle-de-Caixa-

**Hospedagem:** Vercel

**Desenvolvimento e manutenção:** Lucas de Sousa Santil.

---

**ASTROAGROCOMERCIAL | Controle, organização e eficiência.**
