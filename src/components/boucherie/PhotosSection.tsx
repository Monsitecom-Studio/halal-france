'use client'

import { useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Props {
  boucherieId: string
  photos: any[]
}

const PHOTO_TYPES = [
  { value: 'certification', label: 'Certificat halal' },
  { value: 'storefront', label: 'Vitrine' },
  { value: 'interior', label: 'Intérieur' },
  { value: 'product', label: 'Produit' },
]

export default function PhotosSection({ boucherieId, photos: initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [type, setType] = useState('storefront')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Connectez-vous pour uploader une photo')
      setUploading(false)
      return
    }

    const bucket = type === 'certification' ? 'certification-photos' : 'boucherie-photos'
    const path = `${boucherieId}/${Date.now()}-${file.name}`

    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file)
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)

    const { data, error: dbErr } = await supabase
      .from('photos')
      .insert({ boucherie_id: boucherieId, user_id: user.id, url: publicUrl, type })
      .select()
      .single()

    if (dbErr) { setError(dbErr.message) }
    else { setPhotos([data, ...photos]); setFile(null); setPreview(null) }
    setUploading(false)
  }

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-lg mb-4">Photos ({photos.length})</h2>

      {/* Galerie */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={p.url} alt={p.type} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {PHOTO_TYPES.find(t => t.value === p.type)?.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium mb-3">Ajouter une photo</p>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input-field text-sm mb-3"
        >
          {PHOTO_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="rounded-lg w-full max-h-40 object-cover" />
            <button
              onClick={() => { setPreview(null); setFile(null) }}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full mt-3 flex items-center justify-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Envoi...' : 'Uploader'}
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-halal-green transition-colors">
            <Camera className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">Cliquez pour choisir une photo</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        )}
      </div>
    </div>
  )
}
