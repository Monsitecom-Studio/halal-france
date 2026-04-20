export type Certification = 'avs' | 'argml' | 'mosquee-paris' | 'acmif' | 'other' | 'unknown'

export interface CertificationInfo {
  id: Certification
  name: string
  full_name: string
  description: string
  color: string
  icon: string
  website?: string
}

export interface Boucherie {
  id: string
  name: string
  slug: string
  address: string
  city: string
  dept: string
  region: string
  lat: number
  lng: number
  phone?: string
  horaires?: string
  rating?: number
  reviews_count: number
  google_place_id?: string
  certification: Certification
  certification_detail?: string
  certification_verified: boolean
  certification_photo_url?: string
  added_by?: string
  is_approved: boolean
  created_at: string
  updated_at: string
  // Stats from view
  rating_combined?: number
  community_reviews_count?: number
  photos_count?: number
  certification_name?: string
  certification_color?: string
  certification_full_name?: string
  region_computed?: string
}

export interface Avis {
  id: string
  boucherie_id: string
  user_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface Photo {
  id: string
  boucherie_id: string
  user_id?: string
  url: string
  type: 'certification' | 'storefront' | 'interior' | 'product'
  created_at: string
}

export interface CertificationVote {
  id: string
  boucherie_id: string
  user_id: string
  certification: Certification
  created_at: string
}

export interface SearchFilters {
  query?: string
  city?: string
  dept?: string
  region?: string
  certification?: Certification | 'all'
  sort?: 'rating' | 'reviews' | 'recent' | 'distance' | 'popular'
  lat?: number
  lng?: number
}

export const CERTIFICATION_INFO: Record<Certification, CertificationInfo> = {
  avs: {
    id: 'avs',
    name: 'AVS',
    full_name: 'Ahl Al-Sunnah Wa-Al-Djamaa',
    description: 'Organisme indépendant, 3 visites/jour sur site, ~100 boucheries certifiées',
    color: '#2563eb',
    icon: '🔵',
    website: 'https://www.avs-france.com',
  },
  argml: {
    id: 'argml',
    name: 'ARGML',
    full_name: 'Mosquée de Lyon',
    description: '~80 contrôleurs rituels, marque INPI déposée',
    color: '#7c3aed',
    icon: '🟣',
    website: 'https://www.mosquee-de-lyon.org',
  },
  'mosquee-paris': {
    id: 'mosquee-paris',
    name: 'Mosquée de Paris',
    full_name: 'Grande Mosquée de Paris',
    description: 'Plus ancienne habilitation française (1939)',
    color: '#d97706',
    icon: '🟡',
    website: 'https://www.mosquee-de-paris.org',
  },
  acmif: {
    id: 'acmif',
    name: 'ACMIF',
    full_name: "Mosquée d'Évry",
    description: 'Certifie Reghalal (LDC), partenariats industriels',
    color: '#059669',
    icon: '🟢',
  },
  other: {
    id: 'other',
    name: 'Autre certification',
    full_name: 'Autre organisme de certification halal',
    description: 'Certifié par un autre organisme halal reconnu (Isla Délices, HMC, IFANCA, etc.)',
    color: '#0891b2',
    icon: '🔷',
  },
  unknown: {
    id: 'unknown',
    name: 'Non vérifié',
    full_name: 'Certification non vérifiée',
    description: 'Auto-déclaré halal sans organisme officiel',
    color: '#6b7280',
    icon: '⚪',
  },
}

export const REGIONS = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  'PACA',
  'Occitanie',
  'Hauts-de-France',
  'Nouvelle-Aquitaine',
  'Grand Est',
  'Pays de la Loire',
  'Bretagne',
  'Normandie',
  'Bourgogne-Franche-Comté',
  'Centre-Val de Loire',
]
