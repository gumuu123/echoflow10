-- ============================================
-- ECHOFLOW ARCHITECTURAL REWRITE SCHEMA
-- ============================================

-- RESET EXTENSIONS AND TABLES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CLEANUP
DROP TABLE IF EXISTS public.regular_clients CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.feature_requests CASCADE;
DROP TABLE IF EXISTS public.support_requests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- 1. BASE SYSTEM USER PROFILES
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT NOT NULL,
    phone_number TEXT,
    facebook_url TEXT,
    email TEXT NOT NULL,
    cover_photo_url TEXT,
    avatar_url TEXT,
    barangay TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT DEFAULT 'Lapu-Lapu City',
    -- PROVIDER SPECIFIC EXTRA FIELDS
    mode_of_payment TEXT, 
    payment_terms TEXT[],  
    offered_services TEXT[], 
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    provider_status TEXT DEFAULT 'none' CHECK (provider_status IN ('none', 'pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MESSAGING ENGINE
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message_text TEXT,
    attachment_urls TEXT[], 
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BOOKINGS TRACKING MATRIX
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'on_hold', 'cancelled', 'completed', 'archived');
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_category TEXT NOT NULL, 
    status booking_status NOT NULL DEFAULT 'pending',
    
    -- SYSTEM TIMESTAMP AUDIT PATHS
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    on_hold_at TIMESTAMP WITH TIME ZONE,
    continued_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. REVIEWS
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. FAVORITES
CREATE TABLE public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(client_id, provider_id)
);

-- 6. SUKI NETWORK
CREATE TABLE public.regular_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, client_id)
);

-- 7. SERVICE DISCOVERY ARCHITECTURE
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_unit TEXT DEFAULT 'hour',
    is_available BOOLEAN DEFAULT true,
    is_boosted BOOLEAN DEFAULT false,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. FEEDBACK & SUPPORT
CREATE TABLE public.feature_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    feedback_text TEXT NOT NULL,
    suggested_feature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.support_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    attachment_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. DISPUTE TRACKING MATRIX
CREATE TABLE public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_image_urls TEXT[],
    status TEXT DEFAULT 'open' NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regular_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Public Categories Access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Public Services Access" ON public.services FOR SELECT USING (is_available = true);
CREATE POLICY "Providers manage own services" ON public.services FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Admins manage all services" ON public.services FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- POLICIES (Previous)
CREATE POLICY "Public Profiles Access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profile Updates Owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profile Insertion Owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Messages Exchange Rule" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Bookings Direct Access" ON public.bookings FOR ALL USING (auth.uid() = client_id OR auth.uid() = provider_id);
CREATE POLICY "Anonymous Reviews Insertion" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anonymous Reviews View" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Favorites Owner Actions" ON public.favorites FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Regulars Provider Rules" ON public.regular_clients FOR ALL USING (auth.uid() = provider_id OR auth.uid() = client_id);
CREATE POLICY "Feedback Submission" ON public.feature_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Support Requests Entry" ON public.support_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Disputes Submission" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Disputes View Owner" ON public.disputes FOR SELECT USING (auth.uid() = reporter_id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================
-- 9. AUTH TRIGGER FOR AUTOMATIC PROFILE SYNC
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    phone_number, 
    city, 
    barangay, 
    street,
    avatar_url,
    cover_photo_url
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Neighbor'),
    COALESCE(new.raw_user_meta_data->>'role', 'client')::user_role,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'city', 'Lapu-Lapu City'),
    COALESCE(new.raw_user_meta_data->>'barangay', ''),
    COALESCE(new.raw_user_meta_data->>'street', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'cover_photo_url', '')
  );
  RETURN new;
END;
$$;

-- CREATE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STORAGE BUCKETS (Note: Manual creation in Supabase Dashboard required for 'message-attachments', 'support-attachments', 'dispute-evidence', 'avatars', 'covers')
