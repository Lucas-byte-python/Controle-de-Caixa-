# Configurar o MySQL com Vercel

O Vercel hospeda o site e as funções da API. O banco MySQL precisa ser um serviço externo compatível com conexões TLS. Uma opção é o PlanetScale (MySQL compatível).

- Documentação de integração Vercel + PlanetScale: https://vercel.com/connect/planetscale
- Guia PlanetScale para Vercel: https://planetscale.com/docs/tutorials/deploy-to-vercel

## 1. Criar o banco

1. Crie uma conta no provedor MySQL escolhido.
2. Crie um banco de dados e uma credencial de conexão dedicada ao projeto.
3. Copie host, porta, usuário, senha e nome do banco. Não compartilhe esses dados em mensagens nem os coloque no GitHub.
4. Prefira uma região próxima da região das funções Vercel.

## 2. Criar as tabelas

Abra o console SQL do provedor, copie o conteúdo de `database/schema.sql` e execute-o no banco recém-criado.

Isso cria:
- `astro_usuarios`: nome, e-mail único e hash bcrypt da senha.
- `astro_configuracoes`: espaço para configurações individuais por usuário.

## 3. Configurar as variáveis no Vercel

No projeto Vercel, abra **Settings → Environment Variables** e cadastre:

| Nome | Valor |
|---|---|
| `MYSQL_HOST` | Host fornecido pelo banco |
| `MYSQL_PORT` | Porta MySQL (normalmente 3306) |
| `MYSQL_USER` | Usuário do banco |
| `MYSQL_PASSWORD` | Senha da conexão |
| `MYSQL_DATABASE` | Nome do banco |
| `MYSQL_SSL` | `true` |
| `SESSION_SECRET` | Chave aleatória com pelo menos 32 caracteres |

Também é possível fornecer uma única variável `MYSQL_URL` no formato `mysql://usuario:senha@host:3306/banco`, em vez das cinco variáveis de conexão separadas.

Para gerar um segredo de sessão localmente com Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Adicione as variáveis aos ambientes **Production**, **Preview** e **Development** conforme necessário. Nunca use valores reais no arquivo `.env.example`.

## 4. Publicar novamente

Depois de salvar as variáveis, faça um novo Deploy no Vercel. O Vercel instalará as dependências descritas em `package.json` e publicará as funções dentro de `api/`.

## 5. Testar

Abra `https://SEU-DOMINIO/api/auth/me`.

- Sem login, a resposta esperada é HTTP 401 com `{"authenticated":false}`.
- Se retornar HTTP 500, confira as variáveis do banco e os logs de Functions no Vercel.
- Depois, abra o site, crie uma conta e entre com ela.

## Endpoints criados

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

O cadastro e login usam o banco MySQL. As senhas são armazenadas com bcrypt e o token de sessão fica em cookie HttpOnly.

**Limitação desta etapa:** o histórico e as movimentações de caixas/paletes ainda permanecem no LocalStorage. A API MySQL desta implementação trata o cadastro e a autenticação; a sincronização do estoque entre computadores exige migrar também as movimentações para endpoints próprios.
