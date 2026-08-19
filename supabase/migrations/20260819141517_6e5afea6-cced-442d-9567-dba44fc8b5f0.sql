
CREATE TYPE public.app_role AS ENUM ('employee','boss');
CREATE TYPE public.sale_category AS ENUM ('new_sim','sim_swap','movies_songs');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.sale_category NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  airtime NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (airtime >= 0),
  note TEXT,
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  gross NUMERIC(14,2) GENERATED ALWAYS AS (quantity * price) STORED,
  net NUMERIC(14,2) GENERATED ALWAYS AS (quantity * price - airtime) STORED,
  employee_share NUMERIC(14,2) GENERATED ALWAYS AS (ROUND((quantity * price - airtime) * 0.40, 2)) STORED,
  boss_share NUMERIC(14,2) GENERATED ALWAYS AS (ROUND((quantity * price - airtime) * 0.60, 2)) STORED
);
CREATE INDEX transactions_occurred_on_idx ON public.transactions (occurred_on DESC);
CREATE INDEX transactions_user_idx ON public.transactions (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- airtime only applies to New SIM Card sales
CREATE OR REPLACE FUNCTION public.enforce_transaction_rules()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.category <> 'new_sim' THEN
    NEW.airtime := 0;
  END IF;
  IF NEW.airtime > NEW.quantity * NEW.price THEN
    RAISE EXCEPTION 'Airtime cannot exceed the gross amount';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER transactions_rules BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_transaction_rules();

-- profiles + role on signup (boss only allowed if no boss exists yet)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  requested TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  final_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.email,''))
  ON CONFLICT (id) DO NOTHING;

  IF requested = 'boss' AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'boss') THEN
    final_role := 'boss';
  ELSE
    final_role := 'employee';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, final_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'boss'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss'));

CREATE POLICY "Employee inserts today sales" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'employee')
    AND occurred_on = CURRENT_DATE
  );
CREATE POLICY "Employee reads own sales" ON public.transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Boss reads all sales" ON public.transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'boss'));
CREATE POLICY "Employee updates own today sales" ON public.transactions FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'employee') AND occurred_on = CURRENT_DATE)
  WITH CHECK (user_id = auth.uid() AND occurred_on = CURRENT_DATE);
CREATE POLICY "Employee deletes own today sales" ON public.transactions FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'employee') AND occurred_on = CURRENT_DATE);

ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
