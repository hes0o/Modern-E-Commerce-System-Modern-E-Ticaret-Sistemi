import { Search, X } from 'lucide-react'
import clsx from 'clsx'

export default function SearchBar({ value, onChange, placeholder = 'Ara...', className }) {
  return (
    <div className={clsx('relative flex items-center', className)}>
      <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 pr-8"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Aramayı temizle"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
