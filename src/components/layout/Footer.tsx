import Link from 'next/link'
import { CERTIFICATION_INFO } from '@/types'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-halal-green font-semibold text-base mb-3">
              <div className="w-6 h-6 rounded bg-halal-green flex items-center justify-center text-white text-[10px] font-bold">HF</div>
              Halal France
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              L&apos;annuaire de référence des boucheries halal certifiées en France.
              Certifications vérifiées par la communauté.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Annuaire</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/boucheries" className="hover:text-halal-green transition-colors">Toutes les boucheries</Link></li>
              <li><Link href="/carte" className="hover:text-halal-green transition-colors">Carte interactive</Link></li>
              <li><Link href="/certifications" className="hover:text-halal-green transition-colors">Les certifications</Link></li>
              <li><Link href="/ajouter" className="hover:text-halal-green transition-colors">Ajouter un établissement</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Certifications</p>
            <ul className="space-y-2 text-sm">
              {Object.values(CERTIFICATION_INFO).filter(c => c.id !== 'unknown').map(c => (
                <li key={c.id}>
                  <Link
                    href={`/boucheries?cert=${c.id}`}
                    className="text-gray-400 hover:text-halal-green transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-xs">{c.icon}</span>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Régions</p>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Île-de-France', 'PACA', 'Auvergne-Rhône-Alpes', 'Hauts-de-France', 'Occitanie', 'Grand Est', 'Pays de la Loire', 'Bretagne'].map(r => (
                <li key={r}>
                  <Link href={`/boucheries?region=${encodeURIComponent(r)}`} className="hover:text-halal-green transition-colors">
                    {r}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-300">© {year} Halal France — Annuaire communautaire indépendant</p>
          <div className="flex items-center gap-4 text-xs text-gray-300">
            <Link href="/ajouter" className="hover:text-halal-green transition-colors">Contribuer</Link>
            <Link href="/certifications" className="hover:text-halal-green transition-colors">Comprendre les certifications</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
