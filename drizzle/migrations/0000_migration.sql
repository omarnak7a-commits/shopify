CREATE TYPE public.app_role AS ENUM ('customer','store_owner','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  disabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND disabled = (SELECT p.disabled FROM public.profiles p WHERE p.id = auth.uid()));
CREATE POLICY "admin profile update" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text := COALESCE(NEW.raw_user_meta_data->>'role','customer');
BEGIN
  IF r NOT IN ('customer','store_owner') THEN r := 'customer'; END IF;
  INSERT INTO public.profiles (id,email,display_name)
  VALUES (NEW.id, lower(NEW.email), COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name',''), split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, r::public.app_role);
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  logo_text text NOT NULL DEFAULT '',
  logo_url text,
  banner_image text NOT NULL DEFAULT '',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores public read" ON public.stores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner insert store" ON public.stores FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND (public.has_role(auth.uid(),'store_owner') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "owner update store" ON public.stores FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "owner delete store" ON public.stores FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.owns_store(_store_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.stores WHERE id = _store_id AND owner_id = auth.uid())
      OR public.has_role(auth.uid(),'admin')
$$;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Other',
  price numeric(10,2),
  image text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write products" ON public.products FOR ALL TO authenticated USING (public.owns_store(store_id)) WITH CHECK (public.owns_store(store_id));

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color text NOT NULL,
  color_hex text NOT NULL DEFAULT '#000000',
  sizes text[] NOT NULL DEFAULT '{}',
  position int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants public read" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write variants" ON public.product_variants FOR ALL TO authenticated
  USING (public.owns_store((SELECT store_id FROM public.products WHERE id = product_id)))
  WITH CHECK (public.owns_store((SELECT store_id FROM public.products WHERE id = product_id)));

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images public read" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write images" ON public.product_images FOR ALL TO authenticated
  USING (public.owns_store((SELECT store_id FROM public.products WHERE id = product_id)))
  WITH CHECK (public.owns_store((SELECT store_id FROM public.products WHERE id = product_id)));

CREATE TABLE public.try_on_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid,
  person_image_path text,
  result_image_path text,
  status text NOT NULL DEFAULT 'processing',
  provider text,
  error text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT ON public.try_on_sessions TO authenticated;
GRANT ALL ON public.try_on_sessions TO service_role;
ALTER TABLE public.try_on_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read sessions" ON public.try_on_sessions FOR SELECT TO authenticated USING (public.owns_store(store_id) OR user_id = auth.uid());

CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id uuid,
  session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read events" ON public.usage_events FOR SELECT TO authenticated USING (public.owns_store(store_id));

CREATE POLICY "media read own folder" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media upload own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media update own folder" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media delete own folder" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-media' AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO public.stores (id,slug,name,tagline,description,logo_text,banner_image,created_at) VALUES ('fe6a7993-d0fd-46da-be72-842e246308ee','north-studio','North Studio','Quiet essentials, made to last.','North Studio makes considered wardrobe staples in natural fabrics — pieces designed to be worn often and kept for years.','N','https://images.pexels.com/photos/8581033/pexels-photo-8581033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-08-12T10:00:00Z');
INSERT INTO public.stores (id,slug,name,tagline,description,logo_text,banner_image,created_at) VALUES ('b02092e4-41e9-4316-ad53-814632a10318','studio-nine','Studio Nine','Considered pieces for everyday wear.','Studio Nine is a small collection of modern basics and soft tailoring — clothing that feels easy and lived-in from the first wear.','9','https://images.pexels.com/photos/9594685/pexels-photo-9594685.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-09-01T14:30:00Z');
INSERT INTO public.products (id,store_id,name,description,category,price,image,created_at) VALUES ('792680c3-eb5e-495d-adae-d76dbc9677a8','fe6a7993-d0fd-46da-be72-842e246308ee','Oversized Cotton Tee','A relaxed-fit tee cut from heavyweight organic cotton. Slightly dropped shoulders and a clean, boxy silhouette that pairs with everything.','T-Shirts',48,'https://images.pexels.com/photos/5746098/pexels-photo-5746098.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-08-15T09:00:00Z');
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('792680c3-eb5e-495d-adae-d76dbc9677a8','Off White','#F3F1EC',ARRAY['S','M','L','XL']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('792680c3-eb5e-495d-adae-d76dbc9677a8','Stone','#B0A89E',ARRAY['S','M','L']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('792680c3-eb5e-495d-adae-d76dbc9677a8','Black','#1C1C1C',ARRAY['S','M','L','XL']::text[]);
INSERT INTO public.products (id,store_id,name,description,category,price,image,created_at) VALUES ('d7252f18-68ed-4cf3-b272-e87aa5d46d91','fe6a7993-d0fd-46da-be72-842e246308ee','Linen Camp Shirt','A lightweight linen shirt with an open collar and relaxed body. Breathable and soft, made for warm days and slow mornings.','Shirts',89,'https://images.pexels.com/photos/8408556/pexels-photo-8408556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-08-18T12:00:00Z');
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('d7252f18-68ed-4cf3-b272-e87aa5d46d91','Sand','#D4C5A9',ARRAY['S','M','L','XL']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('d7252f18-68ed-4cf3-b272-e87aa5d46d91','Olive','#6B6B4A',ARRAY['M','L']::text[]);
INSERT INTO public.products (id,store_id,name,description,category,price,image,created_at) VALUES ('653265ce-7629-4477-8627-f81565b4d5a9','fe6a7993-d0fd-46da-be72-842e246308ee','Heavyweight Hoodie','A brushed-fleece hoodie with a generous hood and ribbed cuffs. Warm without bulk, with a clean finish that holds its shape.','Hoodies',120,'https://images.pexels.com/photos/9594087/pexels-photo-9594087.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-08-20T10:00:00Z');
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('653265ce-7629-4477-8627-f81565b4d5a9','Heather Grey','#A8A8A4',ARRAY['S','M','L','XL']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('653265ce-7629-4477-8627-f81565b4d5a9','Black','#1C1C1C',ARRAY['S','M','L','XL']::text[]);
INSERT INTO public.products (id,store_id,name,description,category,price,image,created_at) VALUES ('03f700c3-5922-4668-8e6c-54cc53ca5e68','fe6a7993-d0fd-46da-be72-842e246308ee','Quilted Field Jacket','A lightweight quilted jacket with a stand collar and zip front. Designed for transitional weather and easy layering.','Jackets',195,'https://images.pexels.com/photos/6044143/pexels-photo-6044143.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-08-25T08:00:00Z');
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('03f700c3-5922-4668-8e6c-54cc53ca5e68','Black','#1C1C1C',ARRAY['S','M','L','XL']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('03f700c3-5922-4668-8e6c-54cc53ca5e68','Khaki','#8B7E5E',ARRAY['M','L','XL']::text[]);
INSERT INTO public.products (id,store_id,name,description,category,price,image,created_at) VALUES ('e9420b5f-13a0-4d2b-9762-4f3c08e31766','b02092e4-41e9-4316-ad53-814632a10318','Slip Midi Dress','A bias-cut slip dress in a soft, flowing fabric. Adjustable straps and a gentle drape that moves with you.','Dresses',135,'https://images.pexels.com/photos/31674953/pexels-photo-31674953.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-09-03T11:00:00Z');
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('e9420b5f-13a0-4d2b-9762-4f3c08e31766','Ivory','#EFEAE2',ARRAY['XS','S','M','L']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('e9420b5f-13a0-4d2b-9762-4f3c08e31766','Black','#1C1C1C',ARRAY['XS','S','M','L']::text[]);
INSERT INTO public.products (id,store_id,name,description,category,price,image,created_at) VALUES ('4f3847b9-e1db-4c5c-923d-3547b5890538','b02092e4-41e9-4316-ad53-814632a10318','Wide-Leg Trouser','High-waisted trousers with a wide, flowing leg. A tailored waistband and a fluid drape for an easy, polished look.','Pants',110,'https://images.pexels.com/photos/36856704/pexels-photo-36856704.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-09-05T13:00:00Z');
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('4f3847b9-e1db-4c5c-923d-3547b5890538','Camel','#B89B78',ARRAY['XS','S','M','L']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('4f3847b9-e1db-4c5c-923d-3547b5890538','Charcoal','#3A3A3A',ARRAY['S','M','L']::text[]);
INSERT INTO public.products (id,store_id,name,description,category,price,image,created_at) VALUES ('27a6dc08-1799-4a1e-94f7-d1f0b13271f4','b02092e4-41e9-4316-ad53-814632a10318','Soft Tailored Blazer','An unstructured blazer with a relaxed shoulder and natural drape. Wear it open over a tee or buttoned for a cleaner line.','Jackets',175,'https://images.pexels.com/photos/19778358/pexels-photo-19778358.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-09-08T09:30:00Z');
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('27a6dc08-1799-4a1e-94f7-d1f0b13271f4','Check','#7A6E5E',ARRAY['XS','S','M','L']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('27a6dc08-1799-4a1e-94f7-d1f0b13271f4','Black','#1C1C1C',ARRAY['S','M','L']::text[]);
INSERT INTO public.products (id,store_id,name,description,category,price,image,created_at) VALUES ('32e1db78-127b-4983-81d4-3213ddb86cf3','b02092e4-41e9-4316-ad53-814632a10318','Merino Knit Top','A fine-gauge merino top with a close, comfortable fit. Lightweight warmth and a smooth, matte finish.','Shirts',95,'https://images.pexels.com/photos/36646353/pexels-photo-36646353.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','2025-09-10T10:00:00Z');
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('32e1db78-127b-4983-81d4-3213ddb86cf3','Black','#1C1C1C',ARRAY['XS','S','M','L']::text[]);
INSERT INTO public.product_variants (product_id,color,color_hex,sizes) VALUES ('32e1db78-127b-4983-81d4-3213ddb86cf3','Oat','#D8CFC0',ARRAY['XS','S','M']::text[]);