-- Публичный справочник: email в public.profiles (копия из auth).
-- Пароли только в auth.users (хеши), не в public.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_idx
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL AND trim(email) <> '';

COMMENT ON COLUMN public.profiles.email IS 'Копия email из auth для справочника; пароль только в auth.users';

-- Разовый backfill (SQL editor, при необходимости):
-- UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE p.id = u.id AND (p.email IS NULL OR trim(p.email) = '');
