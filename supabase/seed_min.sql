-- ==========================================================
-- ResidenSmart minimal seed: 1 condominium, 1 block, 2 units,
-- 2 amenities. Versioned only, uses fixed UUIDs for idempotency.
-- NOTE: users are created via Supabase Auth first, then linked with:
--   UPDATE public.profiles SET role = '<admin|resident|security>',
--     unit_id = '<unit-uuid>', condominium_id = '<condo-uuid>'
--   WHERE id = '<auth-user-uuid>';
-- No keys or real emails are included in this file.
-- NOTE: created_by is NULL here; either replace it with the admin
-- auth user id or relax condominiums.created_by to NULLABLE before
-- inserting, then set it once the admin user exists.
-- ==========================================================

INSERT INTO public.condominiums (id, name, nit, address, logo_url, created_by)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Conjunto Residencial Ejemplo',
  'NIT-000000',
  'Calle Ejemplo 123',
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blocks (id, condominium_id, name)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Torre A'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.units (id, block_id, unit_number, floor, coefficient, balance)
VALUES
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '101', 1, 0.0125, 0.00),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '102', 1, 0.0125, 0.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.amenities (id, name, capacity, rules)
VALUES
  ('55555555-5555-5555-5555-555555555555', 'Salon comunal', 50, 'Reservar con 48h de anticipacion.'),
  ('66666666-6666-6666-6666-666666666666', 'Piscina', 20, 'Horario 8am-8pm. Sin mascotas.')
ON CONFLICT (id) DO NOTHING;
