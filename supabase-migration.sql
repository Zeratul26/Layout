-- Trigger: crea tenant automaticamente quando un utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tenants (id, company_name, email, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'company_name',
    NEW.email,
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: solo lettura (l'insert è gestito dal trigger)
DROP POLICY IF EXISTS "Users can insert own tenant" ON tenants;

CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own tenant"
  ON tenants FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Bucket Storage per i logo aziendali
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
