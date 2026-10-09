-- Crea 30 restaurantes de demostración con perfiles y menús.
-- Ejecutar completo en Supabase SQL Editor.

DO $$
DECLARE
  current_service_id uuid;
  business_id uuid;
  section_id uuid;
  current_section_id uuid;
  selected_city_id text;
  restaurant_slug text;
  restaurant_name text;
  i integer;
BEGIN
  FOR i IN 1..30 LOOP
    SELECT c.id INTO selected_city_id
    FROM public.cities AS c
    ORDER BY c.name
    OFFSET ((i - 1) % GREATEST((SELECT COUNT(*) FROM public.cities), 1))
    LIMIT 1;
    restaurant_slug := format('demo-restaurante-panama-%s', i);
    restaurant_name := format('Sabores de Panamá %s', i);

    INSERT INTO public.businesses (slug, name, description, city_id)
    VALUES (restaurant_slug, restaurant_name, 'Restaurante ficticio para pruebas.', selected_city_id)
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name, city_id = EXCLUDED.city_id, updated_at = now()
    RETURNING id INTO business_id;

    INSERT INTO public.services (
      slug, business_id, category_id, name, city_id, search_description,
      description, is_recommended, status, base_price_cents,
      cached_price_from_cents, currency, rating_avg, rating_count, area_label
    ) VALUES (
      restaurant_slug, business_id, 'restaurantes', restaurant_name, selected_city_id,
      format('Cocina panameña y caribeña · Registro %s', i),
      'Restaurante ficticio con ingredientes frescos, ambiente familiar y atención cercana.',
      i <= 10, 'published', 1200 + (i * 100), NULL, 'USD',
      4.1 + ((i % 9) * 0.1), 4 + i, 'Panamá'
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      city_id = EXCLUDED.city_id,
      base_price_cents = EXCLUDED.base_price_cents,
      cached_price_from_cents = NULL,
      rating_avg = EXCLUDED.rating_avg,
      rating_count = EXCLUDED.rating_count,
      updated_at = now()
    RETURNING id INTO current_service_id;

    INSERT INTO public.restaurant_profiles (
      service_id, tag, payment_methods, hours_from, hours_to
    ) VALUES (
      current_service_id,
      CASE WHEN i % 3 = 0 THEN 'Mariscos'
        WHEN i % 2 = 0 THEN 'Cocina caribeña'
        ELSE 'Cocina panameña' END,
      ARRAY['Efectivo', 'Tarjeta', 'Yappy'], '11:00', '22:00'
    ) ON CONFLICT (service_id) DO UPDATE SET
      tag = EXCLUDED.tag,
      payment_methods = EXCLUDED.payment_methods,
      hours_from = EXCLUDED.hours_from,
      hours_to = EXCLUDED.hours_to,
      updated_at = now();

    INSERT INTO public.service_photos (
      service_id, storage_path, is_cover, alt_text, position
    )
    SELECT current_service_id, format('demo-restaurantes/restaurante-%s-cover.jpg', i),
      true, format('Imagen principal de %s', restaurant_name), 0
    WHERE NOT EXISTS (
      SELECT 1 FROM public.service_photos AS photo
      WHERE photo.service_id = current_service_id AND photo.is_cover = true
    );

    INSERT INTO public.menu_sections (service_id, title, position)
    SELECT current_service_id, 'Platos recomendados', 1
    WHERE NOT EXISTS (
      SELECT 1 FROM public.menu_sections AS menu
      WHERE menu.service_id = current_service_id
        AND menu.title = 'Platos recomendados'
    );

    SELECT menu.id INTO section_id
    FROM public.menu_sections AS menu
    WHERE menu.service_id = current_service_id
      AND menu.title = 'Platos recomendados'
    LIMIT 1;
    current_section_id := section_id;

    INSERT INTO public.menu_dishes (
      section_id, name, description, price_cents, position
    )
    SELECT section_id, 'Ceviche caribeño',
      'Pescado fresco marinado con cítricos y vegetales.', 950, 1
    WHERE NOT EXISTS (
      SELECT 1 FROM public.menu_dishes AS dish
      WHERE dish.section_id = current_section_id
        AND dish.name = 'Ceviche caribeño'
    );

    INSERT INTO public.menu_dishes (
      section_id, name, description, price_cents, position
    )
    SELECT section_id, 'Arroz con mariscos',
      'Arroz preparado con mariscos frescos y especias locales.', 1850, 2
    WHERE NOT EXISTS (
      SELECT 1 FROM public.menu_dishes AS dish
      WHERE dish.section_id = current_section_id
        AND dish.name = 'Arroz con mariscos'
    );

    INSERT INTO public.menu_dishes (
      section_id, name, description, price_cents, position
    )
    SELECT section_id, 'Tres leches tropical',
      'Postre casero con frutas panameñas.', 550, 3
    WHERE NOT EXISTS (
      SELECT 1 FROM public.menu_dishes AS dish
      WHERE dish.section_id = current_section_id
        AND dish.name = 'Tres leches tropical'
    );

    INSERT INTO public.restaurant_service_features (service_id, feature_id)
    SELECT current_service_id, feature.id
    FROM public.restaurant_feature_catalog AS feature
    ORDER BY feature.sort_order
    LIMIT 4
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

SELECT COUNT(*) AS total_restaurantes
FROM public.services
WHERE category_id = 'restaurantes'
  AND status = 'published';
