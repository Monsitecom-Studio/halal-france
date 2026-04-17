-- =====================================================
-- HALAL FRANCE — Schema Supabase
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABLE: certifications (référentiel)
-- =====================================================
CREATE TABLE IF NOT EXISTS certifications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  website TEXT
);

INSERT INTO certifications VALUES
  ('avs', 'AVS', 'Ahl Al-Sunnah Wa-Al-Djamaa', 'Organisme indépendant, 3 visites/jour sur site, ~100 boucheries certifiées en France', '#2563eb', '🔵', 'https://www.avs-france.com'),
  ('argml', 'ARGML', 'Association pour la Gestion de la Mosquée de Lyon', 'Mosquée de Lyon, ~80 contrôleurs rituels, marque INPI déposée', '#7c3aed', '🟣', 'https://www.mosquee-de-lyon.org'),
  ('mosquee-paris', 'Grande Mosquée de Paris', 'Grande Mosquée de Paris', 'Plus ancienne habilitation française (1939), comité religieux + scientifique', '#d97706', '🟡', 'https://www.mosquee-de-paris.org'),
  ('acmif', 'ACMIF', 'Association Cultuelle Musulmane de l''Île-de-France', 'Certifie Reghalal (LDC/Groupe Doux), partenariats industriels', '#059669', '🟢', null),
  ('unknown', 'Non vérifié', 'Certification non vérifiée', 'Auto-déclaré halal sans certification par un organisme officiel reconnu', '#6b7280', '⚪', null)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TABLE: boucheries
-- =====================================================
CREATE TABLE IF NOT EXISTS boucheries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  dept TEXT NOT NULL,
  region TEXT,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  phone TEXT,
  horaires TEXT,
  rating FLOAT,
  reviews_count INT DEFAULT 0,
  google_place_id TEXT UNIQUE,
  certification TEXT DEFAULT 'unknown' REFERENCES certifications(id),
  certification_verified BOOLEAN DEFAULT false,
  certification_photo_url TEXT,
  added_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wrapper IMMUTABLE requis pour unaccent() dans un index
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text AS $$
  SELECT public.unaccent($1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

-- Index full-text search
CREATE INDEX IF NOT EXISTS boucheries_name_idx ON boucheries USING gin(to_tsvector('french', public.immutable_unaccent(name)));
CREATE INDEX IF NOT EXISTS boucheries_city_idx ON boucheries USING gin(to_tsvector('french', public.immutable_unaccent(city)));
CREATE INDEX IF NOT EXISTS boucheries_dept_idx ON boucheries(dept);
CREATE INDEX IF NOT EXISTS boucheries_cert_idx ON boucheries(certification);
CREATE INDEX IF NOT EXISTS boucheries_geo_idx ON boucheries(lat, lng);
CREATE INDEX IF NOT EXISTS boucheries_approved_idx ON boucheries(is_approved);

-- Génération du slug
CREATE OR REPLACE FUNCTION generate_slug(input TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(public.unaccent(input));
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-slug avant insert/update
CREATE OR REPLACE FUNCTION set_boucherie_slug() RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  base_slug := generate_slug(NEW.name || ' ' || NEW.city);
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM boucheries WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER boucheries_slug_trigger
  BEFORE INSERT OR UPDATE ON boucheries
  FOR EACH ROW EXECUTE FUNCTION set_boucherie_slug();

-- Mapping dept → région
CREATE OR REPLACE FUNCTION get_region_from_dept(dept TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN CASE dept
    WHEN '75' THEN 'Île-de-France' WHEN '77' THEN 'Île-de-France' WHEN '78' THEN 'Île-de-France'
    WHEN '91' THEN 'Île-de-France' WHEN '92' THEN 'Île-de-France' WHEN '93' THEN 'Île-de-France'
    WHEN '94' THEN 'Île-de-France' WHEN '95' THEN 'Île-de-France'
    WHEN '13' THEN 'PACA' WHEN '83' THEN 'PACA' WHEN '84' THEN 'PACA'
    WHEN '04' THEN 'PACA' WHEN '05' THEN 'PACA' WHEN '06' THEN 'PACA'
    WHEN '69' THEN 'Auvergne-Rhône-Alpes' WHEN '01' THEN 'Auvergne-Rhône-Alpes'
    WHEN '07' THEN 'Auvergne-Rhône-Alpes' WHEN '26' THEN 'Auvergne-Rhône-Alpes'
    WHEN '38' THEN 'Auvergne-Rhône-Alpes' WHEN '42' THEN 'Auvergne-Rhône-Alpes'
    WHEN '43' THEN 'Auvergne-Rhône-Alpes' WHEN '63' THEN 'Auvergne-Rhône-Alpes'
    WHEN '73' THEN 'Auvergne-Rhône-Alpes' WHEN '74' THEN 'Auvergne-Rhône-Alpes'
    WHEN '31' THEN 'Occitanie' WHEN '09' THEN 'Occitanie' WHEN '11' THEN 'Occitanie'
    WHEN '12' THEN 'Occitanie' WHEN '30' THEN 'Occitanie' WHEN '32' THEN 'Occitanie'
    WHEN '34' THEN 'Occitanie' WHEN '46' THEN 'Occitanie' WHEN '48' THEN 'Occitanie'
    WHEN '65' THEN 'Occitanie' WHEN '66' THEN 'Occitanie' WHEN '81' THEN 'Occitanie'
    WHEN '82' THEN 'Occitanie'
    WHEN '59' THEN 'Hauts-de-France' WHEN '62' THEN 'Hauts-de-France'
    WHEN '02' THEN 'Hauts-de-France' WHEN '60' THEN 'Hauts-de-France' WHEN '80' THEN 'Hauts-de-France'
    WHEN '33' THEN 'Nouvelle-Aquitaine' WHEN '64' THEN 'Nouvelle-Aquitaine'
    WHEN '40' THEN 'Nouvelle-Aquitaine' WHEN '47' THEN 'Nouvelle-Aquitaine'
    WHEN '24' THEN 'Nouvelle-Aquitaine' WHEN '16' THEN 'Nouvelle-Aquitaine'
    WHEN '17' THEN 'Nouvelle-Aquitaine' WHEN '19' THEN 'Nouvelle-Aquitaine'
    WHEN '23' THEN 'Nouvelle-Aquitaine' WHEN '79' THEN 'Nouvelle-Aquitaine'
    WHEN '86' THEN 'Nouvelle-Aquitaine' WHEN '87' THEN 'Nouvelle-Aquitaine'
    WHEN '44' THEN 'Pays de la Loire' WHEN '49' THEN 'Pays de la Loire'
    WHEN '53' THEN 'Pays de la Loire' WHEN '72' THEN 'Pays de la Loire' WHEN '85' THEN 'Pays de la Loire'
    WHEN '67' THEN 'Grand Est' WHEN '68' THEN 'Grand Est' WHEN '57' THEN 'Grand Est'
    WHEN '54' THEN 'Grand Est' WHEN '55' THEN 'Grand Est' WHEN '88' THEN 'Grand Est'
    WHEN '08' THEN 'Grand Est' WHEN '10' THEN 'Grand Est' WHEN '51' THEN 'Grand Est'
    WHEN '52' THEN 'Grand Est'
    WHEN '35' THEN 'Bretagne' WHEN '29' THEN 'Bretagne' WHEN '22' THEN 'Bretagne' WHEN '56' THEN 'Bretagne'
    WHEN '76' THEN 'Normandie' WHEN '27' THEN 'Normandie' WHEN '14' THEN 'Normandie'
    WHEN '50' THEN 'Normandie' WHEN '61' THEN 'Normandie'
    WHEN '37' THEN 'Centre-Val de Loire' WHEN '18' THEN 'Centre-Val de Loire'
    WHEN '28' THEN 'Centre-Val de Loire' WHEN '36' THEN 'Centre-Val de Loire'
    WHEN '41' THEN 'Centre-Val de Loire' WHEN '45' THEN 'Centre-Val de Loire'
    WHEN '21' THEN 'Bourgogne-Franche-Comté' WHEN '25' THEN 'Bourgogne-Franche-Comté'
    WHEN '39' THEN 'Bourgogne-Franche-Comté' WHEN '58' THEN 'Bourgogne-Franche-Comté'
    WHEN '70' THEN 'Bourgogne-Franche-Comté' WHEN '71' THEN 'Bourgogne-Franche-Comté'
    WHEN '89' THEN 'Bourgogne-Franche-Comté' WHEN '90' THEN 'Bourgogne-Franche-Comté'
    ELSE 'Autre'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- TABLE: avis
-- =====================================================
CREATE TABLE IF NOT EXISTS avis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boucherie_id UUID NOT NULL REFERENCES boucheries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(boucherie_id, user_id)
);

CREATE INDEX IF NOT EXISTS avis_boucherie_idx ON avis(boucherie_id);

-- =====================================================
-- TABLE: photos
-- =====================================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boucherie_id UUID NOT NULL REFERENCES boucheries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('certification', 'storefront', 'interior', 'product')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS photos_boucherie_idx ON photos(boucherie_id);

-- =====================================================
-- TABLE: certification_votes
-- =====================================================
CREATE TABLE IF NOT EXISTS certification_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boucherie_id UUID NOT NULL REFERENCES boucheries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  certification TEXT NOT NULL REFERENCES certifications(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(boucherie_id, user_id)
);

-- =====================================================
-- VUE: boucheries enrichies avec stats
-- =====================================================
CREATE OR REPLACE VIEW boucheries_with_stats AS
SELECT
  b.*,
  get_region_from_dept(b.dept) AS region_computed,
  COALESCE(AVG(a.rating), b.rating) AS rating_combined,
  COALESCE(COUNT(a.id), 0) AS community_reviews_count,
  COALESCE(COUNT(p.id), 0) AS photos_count,
  c.name AS certification_name,
  c.color AS certification_color,
  c.full_name AS certification_full_name
FROM boucheries b
LEFT JOIN avis a ON a.boucherie_id = b.id
LEFT JOIN photos p ON p.boucherie_id = b.id
LEFT JOIN certifications c ON c.id = b.certification
WHERE b.is_approved = true
GROUP BY b.id, c.id;

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE boucheries ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_votes ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "boucheries_public_read" ON boucheries FOR SELECT USING (is_approved = true);
CREATE POLICY "certifications_public_read" ON certifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "avis_public_read" ON avis FOR SELECT USING (true);
CREATE POLICY "photos_public_read" ON photos FOR SELECT USING (true);
CREATE POLICY "cert_votes_public_read" ON certification_votes FOR SELECT USING (true);

-- Écriture authentifiée
CREATE POLICY "boucheries_auth_insert" ON boucheries FOR INSERT TO authenticated
  WITH CHECK (added_by = auth.uid());
CREATE POLICY "avis_auth_insert" ON avis FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "avis_auth_update" ON avis FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "avis_auth_delete" ON avis FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "photos_auth_insert" ON photos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "cert_votes_auth_insert" ON certification_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "cert_votes_auth_update" ON certification_votes FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- Storage Buckets (à créer via dashboard Supabase)
-- =====================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('certification-photos', 'certification-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('boucherie-photos', 'boucherie-photos', true);
