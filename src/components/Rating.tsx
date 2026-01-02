import { Star } from './Icons'

export default function Rating({ rating, external, small }: { rating?: number; external?: number; small?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${small ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center gap-1 text-aurora">
        <Star className={`text-ember ${small ? 'w-4 h-4' : 'w-5 h-5'}`} />
        <span>{rating ? `${rating.toFixed(1)}/10` : 'No rating'}</span>
      </div>
      <span className="text-smoke">•</span>
      <span className="text-smoke">External {external ? `${external.toFixed(1)}/10` : 'n/a'}</span>
    </div>
  )
}
