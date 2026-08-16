-- ==========================================================
-- RESIDENSMART / MIGRACIÓN: VINCULACIÓN AUTOMÁTICA DE RESIDENTES
-- ==========================================================

-- 1. Eliminar estructuras previas si existen
DROP TRIGGER IF EXISTS on_profile_unit_changed ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_profile_unit_change() CASCADE;

-- 2. Crear trigger para actualizar owner_id en units automáticamente
CREATE OR REPLACE FUNCTION public.handle_profile_unit_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unit_id IS DISTINCT FROM OLD.unit_id AND NEW.unit_id IS NOT NULL THEN
    UPDATE public.units
    SET owner_id = NEW.id
    WHERE id = NEW.unit_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_unit_changed
  AFTER UPDATE OF unit_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_unit_change();

-- 3. Actualizar la política de selección de la tabla units
-- Primero eliminamos la política anterior
DROP POLICY IF EXISTS "Residentes y Seguridad ven unidades" ON units;

-- Creamos la nueva política que permite ver la unidad a cualquier usuario autenticado para poder elegirla en el onboarding
CREATE POLICY "Residentes y Seguridad ven unidades" ON units 
FOR SELECT TO authenticated 
USING ( true );

-- Mensaje de éxito
SELECT 'Migración aplicada con éxito: Trigger de vinculación de perfiles y actualización de RLS de unidades creados.' as resultado;
