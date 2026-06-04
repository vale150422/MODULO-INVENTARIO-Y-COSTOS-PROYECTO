// src/components/search/SearchBar.tsx
import './SearchBar.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

const SearchBar = ({ value, onChange, placeholder = 'Buscar...', resultCount, totalCount }: Props) => (
  <div className="sb-wrapper">
    <div className="sb-input-group">
      <svg className="sb-icon" viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <input
        className="sb-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="sb-clear" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
          ×
        </button>
      )}
    </div>
    {value && resultCount !== undefined && totalCount !== undefined && (
      <span className="sb-count">
        {resultCount === 0
          ? 'Sin resultados'
          : `${resultCount} de ${totalCount}`}
      </span>
    )}
  </div>
);

export default SearchBar;