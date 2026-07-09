-- Aggiunge colonna theme_settings se non esiste già
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT NULL;

-- Trigger: crea tenant automaticamente quando un utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tenants (id, company_name, email, status, theme_settings)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'company_name',
    NEW.email,
    'pending',
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: solo lettura e update (l'insert è gestito dal trigger)
DROP POLICY IF EXISTS "Users can insert own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can update own tenant" ON tenants;

CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own tenant"
  ON tenants FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
