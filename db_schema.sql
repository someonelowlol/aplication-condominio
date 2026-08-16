-- ==========================================================
-- RESIDENSMART / CONDOVERSE DATABASE SCHEMA & POLICIES
-- ==========================================================

-- 1. ELIMINAR ESTRUCTURAS EXISTENTES (Limpieza para reinicio limpio)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS trigger_check_balance_before_booking ON bookings;
DROP FUNCTION IF EXISTS public.check_unit_balance_before_booking() CASCADE;
DROP FUNCTION IF EXISTS public.process_administration_payment(UUID, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_unit_id(UUID) CASCADE;
DROP TRIGGER IF EXISTS on_profile_unit_changed ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_profile_unit_change() CASCADE;

DROP TABLE IF EXISTS visitor_invitations CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS condominiums CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 2. CREACIÓN DE ENUMS Y TABLAS JERÁRQUICAS
CREATE TYPE user_role AS ENUM ('admin', 'resident', 'security');

-- Tabla de Condominios / Copropiedades (created_by se vincula directamente a auth.users para evitar fallos de llaves cruzadas)
CREATE TABLE condominiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    nit VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    logo_url TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Bloques / Torres
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_block_name_per_condo UNIQUE (condominium_id, name)
);

-- Tabla de Unidades (Aptos / Casas)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    floor INT NOT NULL,
    coefficient NUMERIC(5, 4) NOT NULL DEFAULT 0.0000, -- Coeficiente de copropiedad (ej. 0.0125 para 1.25%)
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    owner_id UUID, -- Se asigna tras asociar un residente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_unit_per_block UNIQUE (block_id, unit_number),
    CONSTRAINT check_coefficient CHECK (coefficient >= 0 AND coefficient <= 1)
);

-- Tabla de Perfiles de Usuario (Espejo de auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'resident',
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    condominium_id UUID REFERENCES condominiums(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agregar llave foránea limpia para dueño de unidad
ALTER TABLE units ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Tabla de Pagos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Áreas Comunes
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Reservas
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_booking_times CHECK (start_time < end_time)
);

-- Tabla de Invitaciones de Visitantes (Tiempo Real)
CREATE TABLE visitor_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    visitor_name VARCHAR(255) NOT NULL,
    visitor_dni VARCHAR(50),
    arrival_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 3. TRIGGERS Y FUNCIONES DE NEGOCIO (LOGIC)
-- ==========================================================

-- A. Trigger para creación automática de perfiles públicos al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'resident'))::public.user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Helper Security Definer para obtener el rol del usuario sin disparar RLS recursivo
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN 'guest';
    END IF;
    
    -- Intenta leer desde el JWT metadata si está presente
    v_role := LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', ''));
    IF v_role != '' THEN
        RETURN v_role;
    END IF;

    -- Consulta la tabla profiles con privilegios SECURITY DEFINER para evitar RLS recursion
    SELECT LOWER(role::TEXT) INTO v_role FROM public.profiles WHERE id = p_user_id;
    RETURN COALESCE(v_role, 'resident');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- C. Helper Security Definer para obtener la unidad del usuario sin disparar RLS recursivo
CREATE OR REPLACE FUNCTION public.get_user_unit_id(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_unit_id UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT unit_id INTO v_unit_id FROM public.profiles WHERE id = p_user_id;
    RETURN v_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- D. Trigger para restringir reservas a usuarios con saldo > 0
CREATE OR REPLACE FUNCTION public.check_unit_balance_before_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    SELECT balance INTO v_balance FROM units WHERE id = NEW.unit_id;
    IF v_balance > 0 THEN
        RAISE EXCEPTION 'No puedes reservar áreas comunes si tienes saldo pendiente de pago ($%)', v_balance;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_check_balance_before_booking
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_unit_balance_before_booking();

-- E. Función Transaccional para Pago de Administración
CREATE OR REPLACE FUNCTION public.process_administration_payment(
    p_unit_id UUID,
    p_amount NUMERIC(12, 2),
    p_receipt_url TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Registrar pago aprobado
    INSERT INTO payments (unit_id, amount, status, date, receipt_url)
    VALUES (p_unit_id, p_amount, 'approved', now(), p_receipt_url);

    -- Descontar del balance de la unidad
    UPDATE units
    SET balance = balance - p_amount
    WHERE id = p_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- F. Trigger para asignar automáticamente el owner_id en la tabla units cuando un perfil se vincula a una unidad
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

CREATE OR REPLACE TRIGGER on_profile_unit_changed
  AFTER UPDATE OF unit_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_unit_change();

-- ==========================================================
-- 4. HABILITACIÓN DE RLS Y POLÍTICAS DE SEGURIDAD (SIN RECURSIÓN)
-- ==========================================================
ALTER TABLE condominiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas para Condominios (Copropiedades)
CREATE POLICY "Admins pueden registrar condominios" ON condominiums FOR INSERT TO authenticated WITH CHECK ( public.get_user_role(auth.uid()) = 'admin' );
CREATE POLICY "Creadores de condominios controlan su condominio" ON condominiums FOR ALL TO authenticated USING ( created_by = auth.uid() );
CREATE POLICY "Residentes e invitados ven información del condominio" ON condominiums FOR SELECT TO authenticated USING ( true );

-- Políticas para Bloques (Torres)
CREATE POLICY "Admins gestionan bloques de su condominio" ON blocks FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM condominiums WHERE id = blocks.condominium_id AND created_by = auth.uid()) ) WITH CHECK ( EXISTS (SELECT 1 FROM condominiums WHERE id = blocks.condominium_id AND created_by = auth.uid()) );
CREATE POLICY "Residentes ven bloques" ON blocks FOR SELECT TO authenticated USING ( true );

-- Políticas para Unidades (Units)
CREATE POLICY "Admins gestionan unidades de su condominio" ON units FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM blocks JOIN condominiums ON blocks.condominium_id = condominiums.id WHERE blocks.id = units.block_id AND condominiums.created_by = auth.uid()) ) WITH CHECK ( EXISTS (SELECT 1 FROM blocks JOIN condominiums ON blocks.condominium_id = condominiums.id WHERE blocks.id = units.block_id AND condominiums.created_by = auth.uid()) );
CREATE POLICY "Residentes y Seguridad ven unidades" ON units FOR SELECT TO authenticated USING ( true );

-- Políticas para Perfiles (Profiles) - CERO SUBCONSULTAS RECURSIVAS A PROFILES
CREATE POLICY "Admins editan perfiles" ON profiles FOR ALL TO authenticated USING ( public.get_user_role(auth.uid()) = 'admin' );
CREATE POLICY "Usuarios ven su propio perfil o seguridad ve todos" ON profiles FOR SELECT TO authenticated USING ( auth.uid() = id OR public.get_user_role(auth.uid()) = 'security' );
CREATE POLICY "Usuarios editan su propio perfil" ON profiles FOR UPDATE TO authenticated USING ( auth.uid() = id );

-- Políticas para Pagos (Payments)
CREATE POLICY "Admins gestionan pagos de sus unidades" ON payments FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM units JOIN blocks ON units.block_id = blocks.id JOIN condominiums ON blocks.condominium_id = condominiums.id WHERE units.id = payments.unit_id AND condominiums.created_by = auth.uid()) );
CREATE POLICY "Residentes ven sus pagos" ON payments FOR SELECT TO authenticated USING ( unit_id = public.get_user_unit_id(auth.uid()) );
CREATE POLICY "Residentes reportan pagos" ON payments FOR INSERT TO authenticated WITH CHECK ( unit_id = public.get_user_unit_id(auth.uid()) );

-- Políticas para Amenities (Áreas Comunes)
CREATE POLICY "Admins gestionan áreas comunes" ON amenities FOR ALL TO authenticated USING ( public.get_user_role(auth.uid()) = 'admin' ) WITH CHECK ( public.get_user_role(auth.uid()) = 'admin' );
CREATE POLICY "Cualquiera ve áreas comunes" ON amenities FOR SELECT TO authenticated USING ( true );

-- Políticas para Reservas (Bookings)
CREATE POLICY "Admins gestionan reservas" ON bookings FOR ALL TO authenticated USING ( public.get_user_role(auth.uid()) = 'admin' );
CREATE POLICY "Cualquiera ve reservas para disponibilidad" ON bookings FOR SELECT TO authenticated USING ( true );
CREATE POLICY "Residentes reservan para su propia unidad" ON bookings FOR INSERT TO authenticated WITH CHECK ( unit_id = public.get_user_unit_id(auth.uid()) );
CREATE POLICY "Residentes editan sus reservas" ON bookings FOR UPDATE TO authenticated USING ( unit_id = public.get_user_unit_id(auth.uid()) );

-- Políticas para Invitaciones (Visitor Invitations)
CREATE POLICY "Admins y Seguridad ven invitaciones" ON visitor_invitations FOR SELECT TO authenticated USING ( public.get_user_role(auth.uid()) IN ('security', 'admin') );
CREATE POLICY "Residentes gestionan invitaciones para su unidad" ON visitor_invitations FOR ALL TO authenticated USING ( unit_id = public.get_user_unit_id(auth.uid()) ) WITH CHECK ( unit_id = public.get_user_unit_id(auth.uid()) );

-- ==========================================================
-- 5. CONFIGURACIÓN DE TIEMPO REAL (SUPABASE REALTIME)
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE visitor_invitations;
