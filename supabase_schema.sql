-- ==============================================================================
-- SUNSEEKERS QR CODE GENERATOR - SUPABASE SCHEMA SETUP
-- Run this in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- ==============================================================================

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create QR Codes Table
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Fleet & Buses',
    url TEXT NOT NULL,
    subtitle TEXT,
    config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure updated_at column exists if table was previously created without it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'qr_codes' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.qr_codes ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- 3. Create Categories Table
CREATE TABLE IF NOT EXISTS public.qr_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Data Types Table
CREATE TABLE IF NOT EXISTS public.qr_data_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    prefix TEXT DEFAULT '',
    placeholder TEXT DEFAULT '',
    hint TEXT DEFAULT '',
    is_builtin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Insert Initial Default Categories (if table is empty)
INSERT INTO public.qr_categories (name)
VALUES 
    ('Fleet & Buses'),
    ('Tickets & Booking'),
    ('Passenger Wi-Fi'),
    ('Customer Feedback'),
    ('VIP Lounges'),
    ('Social & Marketing'),
    ('Operations')
ON CONFLICT (name) DO NOTHING;

-- 6. Insert Initial Default Data Types
INSERT INTO public.qr_data_types (id, name, prefix, placeholder, hint, is_builtin)
VALUES 
    ('url', 'Website / Link (URL)', '', 'https://sunseekers.co.za/book', 'Validates website destination automatically', true),
    ('wifi', 'Bus Wi-Fi Connect', 'WIFI:', '', 'Direct one-tap passenger onboard Wi-Fi connection', true),
    ('whatsapp', 'WhatsApp Booking Line', 'https://wa.me/', '+27821234567', 'Direct WhatsApp chat with customer dispatch', true),
    ('vcard', 'Business Contact (vCard)', 'BEGIN:VCARD', '', 'Instant contact save to passenger phone address book', true),
    ('text', 'Plain Text / Note', '', 'Custom text or code', 'Displays plain text or reference code when scanned', true),
    ('phone', 'Direct Phone Call', 'tel:', '+27 11 555 0199', 'Prompts phone dialer to call dispatch desk directly', false),
    ('email', 'Email Dispatch', 'mailto:', 'info@sunseekers.co.za', 'Opens email client with pre-addressed email', false),
    ('sms', 'SMS Text Message', 'SMSTO:', '+27821234567', 'Opens SMS messenger with pre-filled number', false),
    ('maps', 'Google Maps Location', 'https://maps.google.com/?q=', 'Sunseekers Terminal, Cape Town', 'Opens Google Maps navigation directly to terminal', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Row Level Security (RLS) Policies
-- Enables public read/write access using Supabase publishable/anon key for your app
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_data_types ENABLE ROW LEVEL SECURITY;

-- Allow anon access (read, insert, update, delete)
DROP POLICY IF EXISTS "Allow anon all on qr_codes" ON public.qr_codes;
CREATE POLICY "Allow anon all on qr_codes" ON public.qr_codes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on qr_categories" ON public.qr_categories;
CREATE POLICY "Allow anon all on qr_categories" ON public.qr_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on qr_data_types" ON public.qr_data_types;
CREATE POLICY "Allow anon all on qr_data_types" ON public.qr_data_types FOR ALL USING (true) WITH CHECK (true);

-- 8. Enable Realtime Replication (optional but recommended for instant live sync)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_codes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_categories;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_data_types;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;
