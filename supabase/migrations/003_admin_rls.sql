-- =====================================================
-- HALAL FRANCE — Migration 003
-- RLS admin pour la validation des boucheries
-- =====================================================

-- Table admins : liste des user_id autorisés
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS sur admins (lecture seule pour soi-même)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_self_read" ON admins FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Fonction helper : est-ce que l'utilisateur courant est admin ?
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
$$ LANGUAGE SQL SECURITY DEFINER;

-- Politique de mise à jour des boucheries : admin seulement pour is_approved
CREATE POLICY "boucheries_admin_update" ON boucheries FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Politique de suppression : admin ou propriétaire (si pas encore approuvée)
CREATE POLICY "boucheries_owner_delete" ON boucheries FOR DELETE TO authenticated
  USING (
    is_admin() OR
    (added_by = auth.uid() AND is_approved = false)
  );

-- Vue admin : toutes les boucheries (approuvées ou non)
CREATE OR REPLACE VIEW boucheries_admin AS
SELECT b.*, 
  c.name AS certification_name,
  c.color AS certification_color
FROM boucheries b
LEFT JOIN certifications c ON c.id = b.certification;

-- Pour voir les boucheries en attente depuis le client Supabase :
-- Ajouter votre user_id dans la table admins via SQL Editor :
-- INSERT INTO admins (user_id) VALUES ('votre-user-id-ici');
