-- Banco de dados do Controle de Caixas & Paletes ASTRO
-- Execute este arquivo no console SQL do seu provedor MySQL.

CREATE TABLE IF NOT EXISTS astro_usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_astro_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS astro_configuracoes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  configuracoes JSON NOT NULL,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_astro_config_usuario (usuario_id),
  KEY idx_astro_config_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Registros de devolução de caixas com comprovante fotográfico.
-- Execute este bloco no banco TiDB Cloud (schema test) após atualizar o sistema.
CREATE TABLE IF NOT EXISTS astro_devolucoes_caixas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  nota_fiscal VARCHAR(50) NOT NULL,
  loja VARCHAR(120) NOT NULL,
  caixa VARCHAR(120) NOT NULL,
  quantidade INT UNSIGNED NOT NULL,
  foto_data_url LONGTEXT NOT NULL,
  foto_nome VARCHAR(255) NOT NULL,
  recebido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_astro_devolucoes_usuario (usuario_id),
  KEY idx_astro_devolucoes_nota (nota_fiscal),
  KEY idx_astro_devolucoes_data (recebido_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
