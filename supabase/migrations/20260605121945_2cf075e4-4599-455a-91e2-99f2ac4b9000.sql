
CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  auto_delete_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
INSERT INTO public.app_settings (id, auto_delete_enabled) VALUES (true, false) ON CONFLICT DO NOTHING;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
