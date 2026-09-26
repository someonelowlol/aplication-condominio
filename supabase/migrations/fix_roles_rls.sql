-- ==========================================================
-- ResidenSmart: harden get_user_role() to read profiles only.
-- apply with service_role, never with anon.
-- Run this file manually in the Supabase SQL editor (it is
-- versioned here but NOT auto-applied by the app).
-- ==========================================================

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN 'guest';
    END IF;

    -- Single source of truth: profiles table. The previous JWT
    -- user_metadata branch was removed because client-writable
    -- metadata must never drive authorization.
    SELECT LOWER(role::TEXT) INTO v_role FROM public.profiles WHERE id = p_user_id;
    RETURN COALESCE(v_role, 'resident');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
