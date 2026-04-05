-- Локальная аутентификация: bcrypt-хеш пароля (никогда не отдавать в API клиенту).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

COMMENT ON COLUMN public.profiles.password_hash IS 'bcrypt; только для проверки входа';
