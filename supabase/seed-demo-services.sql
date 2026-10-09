-- Datos de demostración para poblar el catálogo de Panamá Viajero.
-- Ejecutar en Supabase SQL Editor. Puede ejecutarse varias veces sin duplicar slugs.

DO $$
DECLARE
  service_id uuid;
  business_id uuid;
  menu_section_id uuid;
  city_id text;
  i integer;
  category_id text;
  service_name text;
  service_slug text;
BEGIN
  -- ============================================================
  -- 30 hospedajes con tres tipos de habitación cada uno
  -- ============================================================
  FOR i IN 1..30 LOOP
    city_id := (
      SELECT c.id
      FROM public.cities AS c
      ORDER BY c.name
      OFFSET ((i - 1) % GREATEST((SELECT count(*) FROM public.cities), 1))
      LIMIT 1
    );
    service_name := format('Hospedaje Panamá %s', i);
    service_slug := format('demo-hospedaje-panama-%s', i);

    INSERT INTO public.businesses (slug, name, description, city_id)
    VALUES (service_slug, service_name, 'Negocio ficticio para pruebas del catálogo.', city_id)
    ON CONFLICT (slug) DO UPDATE SET updated_at = now()
    RETURNING id INTO business_id;

    IF business_id IS NULL THEN
      SELECT id INTO business_id FROM public.businesses WHERE slug = service_slug;
    END IF;

    INSERT INTO public.services (
      slug, business_id, category_id, name, city_id, search_description,
      description, is_recommended, status, cached_price_from_cents, rating_avg,
      rating_count, area_label, hospedaje_type_id, meal_plan_id
    )
    VALUES (
      service_slug, business_id, 'hospedaje', service_name, city_id,
      format('Alojamiento de prueba en Panamá · Desayuno incluido · Registro %s', i),
      'Alojamiento ficticio creado para visualizar habitaciones, precios, servicios y reservas.',
      i <= 10, 'published', 6500 + (i * 500), 4.2 + ((i % 8) * 0.1),
      3 + i, 'Panamá',
      (SELECT id FROM public.hospedaje_types ORDER BY sort_order LIMIT 1),
      (SELECT id FROM public.meal_plans ORDER BY sort_order LIMIT 1)
    )
    ON CONFLICT (slug) DO NOTHING;

    SELECT id INTO service_id FROM public.services WHERE slug = service_slug;

    INSERT INTO public.room_types (
      slug, service_id, name, description, capacity, beds_label,
      price_cents, total_units, position
    ) VALUES
      (service_slug || '-estandar', service_id, 'Habitación estándar',
       'Habitación cómoda con aire acondicionado y baño privado.', 2,
       '1 cama matrimonial', 6500 + (i * 500), 6, 1),
      (service_slug || '-deluxe', service_id, 'Habitación deluxe',
       'Habitación amplia con balcón y espacio de trabajo.', 3,
       '1 cama king y 1 sofá cama', 9500 + (i * 500), 4, 2),
      (service_slug || '-familiar', service_id, 'Suite familiar',
       'Suite para familias con sala independiente y terraza.', 5,
       '2 camas queen', 14000 + (i * 500), 2, 3)
    ON CONFLICT (slug) DO NOTHING;
  END LOOP;

  -- ============================================================
  -- 30 restaurantes con perfil, horarios y menú de muestra
  -- ============================================================
  FOR i IN 1..30 LOOP
    city_id := (
      SELECT c.id
      FROM public.cities AS c
      ORDER BY c.name
      OFFSET ((i - 1) % GREATEST((SELECT count(*) FROM public.cities), 1))
      LIMIT 1
    );
    service_name := format('Sabores de Panamá %s', i);
    service_slug := format('demo-restaurante-panama-%s', i);

    INSERT INTO public.businesses (slug, name, description, city_id)
    VALUES (service_slug, service_name, 'Restaurante ficticio para pruebas del catálogo.', city_id)
    ON CONFLICT (slug) DO UPDATE SET updated_at = now()
    RETURNING id INTO business_id;

    IF business_id IS NULL THEN
      SELECT id INTO business_id FROM public.businesses WHERE slug = service_slug;
    END IF;

    INSERT INTO public.services (
      slug, business_id, category_id, name, city_id, search_description,
      description, is_recommended, status, cached_price_from_cents, rating_avg,
      rating_count, area_label
    )
    VALUES (
      service_slug, business_id, 'restaurantes', service_name, city_id,
      format('Cocina panameña y caribeña · Registro %s', i),
      'Restaurante ficticio con sabores locales, ingredientes frescos y ambiente familiar.',
      i <= 10, 'published', 1200 + (i * 100), 4.1 + ((i % 9) * 0.1),
      2 + i, 'Panamá'
    )
    ON CONFLICT (slug) DO NOTHING;

    SELECT id INTO service_id FROM public.services WHERE slug = service_slug;

    INSERT INTO public.restaurant_profiles (
      service_id, tag, payment_methods, hours_from, hours_to
    ) VALUES (
      service_id, 'Cocina panameña', ARRAY['Efectivo', 'Tarjeta', 'Yappy'],
      '11:00', '22:00'
    ) ON CONFLICT (service_id) DO NOTHING;

    INSERT INTO public.menu_sections (service_id, title, position)
    VALUES (service_id, 'Platos recomendados', 1)
    ON CONFLICT DO NOTHING;

    SELECT id INTO menu_section_id
    FROM public.menu_sections AS ms
    WHERE ms.service_id = (
      SELECT s.id FROM public.services AS s WHERE s.slug = service_slug
    )
    ORDER BY position
    LIMIT 1;

    INSERT INTO public.menu_dishes (section_id, name, description, price_cents, position)
    VALUES
      (menu_section_id, 'Ceviche caribeño', 'Pescado fresco con cítricos y vegetales.', 950, 1),
      (menu_section_id, 'Patacones rellenos', 'Patacones crujientes con guiso local.', 850, 2),
      (menu_section_id, 'Tres leches tropical', 'Postre casero con frutas panameñas.', 550, 3);
  END LOOP;

  -- ============================================================
  -- 30 transportes, agencias y traslados privados
  -- ============================================================
  FOR i IN 1..30 LOOP
    city_id := (
      SELECT c.id
      FROM public.cities AS c
      ORDER BY c.name
      OFFSET ((i - 1) % GREATEST((SELECT count(*) FROM public.cities), 1))
      LIMIT 1
    );
    service_name := format('Traslados Panamá %s', i);
    service_slug := format('demo-transporte-panama-%s', i);

    INSERT INTO public.businesses (slug, name, description, city_id)
    VALUES (service_slug, service_name, 'Agencia de transporte ficticia para pruebas.', city_id)
    ON CONFLICT (slug) DO UPDATE SET updated_at = now()
    RETURNING id INTO business_id;

    IF business_id IS NULL THEN
      SELECT id INTO business_id FROM public.businesses WHERE slug = service_slug;
    END IF;

    INSERT INTO public.services (
      slug, business_id, category_id, name, city_id, search_description,
      description, is_recommended, status, cached_price_from_cents, rating_avg,
      rating_count, area_label
    )
    VALUES (
      service_slug, business_id, 'transporte', service_name, city_id,
      format('Traslado privado, compartido o agencia · Registro %s', i),
      'Servicio ficticio de transporte para conectar viajeros con destinos y experiencias.',
      i <= 10, 'published', 1800 + (i * 150), 4.0 + ((i % 10) * 0.1),
      1 + i, 'Panamá'
    )
    ON CONFLICT (slug) DO NOTHING;

    SELECT id INTO service_id FROM public.services WHERE slug = service_slug;

    INSERT INTO public.service_schedules (service_id, departure_time)
    VALUES
      (service_id, '07:00'), (service_id, '10:00'), (service_id, '14:00'),
      (service_id, '18:00')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
