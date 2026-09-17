import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import ProductGrid from '../components/ProductGrid';
import { EmptyState, ErrorState, ProductGridSkeleton } from '../components/StateViews';
import { FilterIcon, SearchIcon } from '../components/Icons';
import { CATEGORIES, getCategory } from '../data/categories';
import { productService } from '../services/productService';
import { useAsync } from '../hooks/useAsync';

const FILTER_KEYS = ['search', 'category', 'minPrice', 'maxPrice', 'availability', 'sort'];

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const [searchInput, setSearchInput] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const [priceError, setPriceError] = useState('');

  // Debounced search-as-you-type.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) update({ search: searchInput });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { data, loading, error, retry } = useAsync(() => productService.list(filters), [params.toString()]);

  function update(patch) {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  }

  function onPriceChange(key, value) {
    const v = value.replace(/[^\d]/g, '');
    const min = key === 'minPrice' ? v : filters.minPrice;
    const max = key === 'maxPrice' ? v : filters.maxPrice;
    setPriceError(min && max && Number(min) > Number(max) ? 'Min price cannot be greater than max price.' : '');
    update({ [key]: v });
  }

  const clearAll = () => {
    setSearchInput('');
    setPriceError('');
    setParams({}, { replace: true });
  };

  const activeCount = ['category', 'minPrice', 'maxPrice', 'availability'].filter((k) => filters[k] && filters[k] !== 'all').length;
  const catName = filters.category ? getCategory(filters.category)?.name ?? 'Products' : 'All Products';
  const title = filters.category ? `Categories/ ${catName}` : 'All Products';

  return (
    <>
      <AppHeader title={title} back />
      <div className="toolbar">
        <div className="search-bar search-bar--compact" role="search">
          <SearchIcon />
          <input type="search" placeholder="Search by product name" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Search products" />
        </div>
        <button className={`icon-btn icon-btn--boxed ${activeCount ? 'is-active' : ''}`} onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} aria-controls="filters" aria-label="Filters">
          <FilterIcon />
          {activeCount > 0 && <span className="count-badge">{activeCount}</span>}
        </button>
      </div>

      <div className="chip-row chip-row--scroll" role="tablist" aria-label="Categories">
        <button role="tab" aria-selected={!filters.category} className={`chip ${!filters.category ? 'is-active' : ''}`} onClick={() => update({ category: '' })}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} role="tab" aria-selected={filters.category === c.id} className={`chip ${filters.category === c.id ? 'is-active' : ''}`} onClick={() => update({ category: c.id })}>
            {c.name}
          </button>
        ))}
      </div>

      {showFilters && (
        <section id="filters" className="filter-panel card">
          <div className="filter-panel__row">
            <label>Min price (₹)<input inputMode="numeric" value={filters.minPrice} onChange={(e) => onPriceChange('minPrice', e.target.value)} placeholder="0" /></label>
            <label>Max price (₹)<input inputMode="numeric" value={filters.maxPrice} onChange={(e) => onPriceChange('maxPrice', e.target.value)} placeholder="5000" /></label>
          </div>
          {priceError && <p className="field__error" role="alert">{priceError}</p>}
          <div className="filter-panel__row">
            <label>Availability
              <select value={filters.availability || 'all'} onChange={(e) => update({ availability: e.target.value === 'all' ? '' : e.target.value })}>
                <option value="all">All</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>
            </label>
            <label>Sort by
              <select value={filters.sort || 'relevance'} onChange={(e) => update({ sort: e.target.value === 'relevance' ? '' : e.target.value })}>
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={clearAll}>Clear all filters</button>
        </section>
      )}

      <div className="section">
        {loading && <ProductGridSkeleton />}
        {error && <ErrorState message={error.message} onRetry={retry} />}
        {data && data.length === 0 && (
          <EmptyState icon="🔍" title="No products found" message="Try a different search term or clear your filters." actionLabel="Clear filters" onAction={clearAll} />
        )}
        {data && data.length > 0 && (
          <>
            <h2 className="for-you">{filters.category ? `${catName} For You!` : 'Picked For You!'}</h2>
            <p className="result-count">{data.length} product{data.length > 1 ? 's' : ''}</p>
            <ProductGrid products={data} />
          </>
        )}
      </div>
    </>
  );
}
