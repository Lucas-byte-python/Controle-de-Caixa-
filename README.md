# 📦 Controle de Caixas e Paletes — ASTROAGROCOMERCIAL

Sistema web desenvolvido para auxiliar no controle e gerenciamento das movimentações de caixas e paletes da **ASTROAGROCOMERCIAL**, empresa do segmento de distribuição de frutas, verduras e hortifrúti.

O projeto tem como objetivo facilitar o acompanhamento das entradas e saídas, proporcionar maior organização operacional e oferecer uma visualização clara dos saldos e históricos de movimentações.

---

## 🚀 Funcionalidades

- **Controle de Caixas:** registro e acompanhamento das entradas e saídas de caixas.
- **Controle de Paletes:** gerenciamento independente das movimentações de paletes.
- **Saldo em tempo real:** atualização automática dos saldos conforme as movimentações.
- **Saldo negativo:** permite registrar movimentações mesmo quando a saída ultrapassa a quantidade disponível.
- **Histórico de movimentações:** consulta dos registros realizados.
- **Edição e exclusão:** gerenciamento das movimentações cadastradas.
- **Relatórios personalizados:** geração de relatórios de caixas, paletes ou ambos.
- **Impressão:** relatórios organizados para impressão.
- **Gráficos:** visualização das movimentações por meio de gráficos.
- **Cadastro e login:** autenticação de usuários pelo backend, com senhas protegidas por bcrypt.
- **Sessões seguras:** cookie HttpOnly validado pelo servidor.
- **Banco MySQL:** cadastro de usuários e estrutura para configurações individuais.
- **Movimentações:** continuam armazenadas localmente no navegador nesta etapa.
- **Interface responsiva:** layout desenvolvido para proporcionar uma experiência prática e organizada.

---

## 🎨 Identidade Visual

O sistema utiliza uma identidade visual corporativa inspirada na ASTROAGROCOMERCIAL, com destaque para os tons de azul, proporcionando uma interface moderna, organizada e profissional.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e identidade visual |
| JavaScript | Funcionalidades e gerenciamento dos dados |
| Chart.js | Gráficos e visualização de informações |
| LocalStorage | Armazenamento dos registros no navegador |

---

## 📂 Estrutura do projeto

```text
Controle-de-Caixa-/
│
├── html/
│   ├── index.html
│   └── load.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── img/
│   └── ecossistema-astro-icon.png
│
└── README.md
```

---

## 💾 Armazenamento de dados

Atualmente, o sistema utiliza o LocalStorage do navegador para armazenar as movimentações.

**Importante:** os dados ficam vinculados ao navegador e ao dispositivo utilizados. Limpar os dados do navegador ou utilizar outro dispositivo pode resultar na ausência dos registros anteriores.

---

## 🌐 Acesso ao sistema

**Projeto no GitHub:**

https://github.com/Lucas-byte-python/Controle-de-Caixa-

**Desenvolvimento e manutenção:** Lucas de Sousa Santil.

---

## 🎯 Objetivo do projeto

Desenvolver uma ferramenta digital que contribua para a organização dos processos internos da ASTROAGROCOMERCIAL, tornando o controle de caixas e paletes mais ágil, visual e eficiente.

O projeto busca transformar atividades operacionais em processos mais organizados, reduzindo a dependência de controles manuais e facilitando o acesso às informações.

---

**ASTROAGROCOMERCIAL | Controle, organização e eficiência.**
