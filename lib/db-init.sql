-- WebAuthn Passkey Credentials Table
-- Stores registered passkeys (fingerprint, Face ID, security keys, etc.)

CREATE TABLE IF NOT EXISTS passkey_credentials (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  credential_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports JSON,
  device_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_credential_id (credential_id(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session challenges (temporary storage for WebAuthn challenges)
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  id VARCHAR(255) PRIMARY KEY,
  challenge TEXT NOT NULL,
  user_id VARCHAR(50),
  type ENUM('registration', 'authentication') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional blog cover image support (safe no-op if already present)
ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS image_url TEXT NULL;
