/**
 * components/ui/SearchBar.jsx — Español neutro.
 */

import { useEffect, useState } from 'react';
import { useNavigate }   from 'react-router-dom';
import { Search }        from 'lucide-react';
import PropTypes         from 'prop-types';
import { SEARCH_TABS }   from '@/utils/constants';

function SearchBar({ initialQuery = '', initialType = 'all', onSearch, compact = false }) {
  const [query, setQuery]     = useState(initialQuery);
  const [activeType, setType] = useState(initialType);
  const navigate              = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
    setType(initialType);
  }, [initialQuery, initialType]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;

    const cleanQuery = query.trim();

    if (onSearch) onSearch(cleanQuery, activeType);
    navigate(`/search?q=${encodeURIComponent(cleanQuery)}&type=${activeType}`);
  }

  return (
    <form className="nl-searchbar" onSubmit={handleSubmit} role="search">
      <div className="nl-searchbar__input-wrap">
        <Search size={20} className="nl-searchbar__icon" aria-hidden="true" />
        <input
          type="text"
          className="nl-searchbar__input"
          placeholder="Busca cualquier producto"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar obras"
          autoComplete="off"
        />
      </div>

      {!compact && (
        <div className="nl-searchbar__tabs" role="tablist" aria-label="Filtrar por tipo">
          {SEARCH_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeType === tab.id}
              className={`nl-searchbar__tab ${activeType === tab.id ? 'nl-searchbar__tab--active' : ''}`}
              onClick={() => {
                setType(tab.id);

                const cleanQuery = query.trim();

                if (onSearch) onSearch(cleanQuery, tab.id);

                if (cleanQuery) {
                  navigate(`/search?q=${encodeURIComponent(cleanQuery)}&type=${tab.id}`);
                } else {
                  navigate(`/search?type=${tab.id}`);
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

SearchBar.propTypes = {
  initialQuery: PropTypes.string,
  initialType:  PropTypes.string,
  onSearch:     PropTypes.func,
  compact:      PropTypes.bool,
};

export default SearchBar;
