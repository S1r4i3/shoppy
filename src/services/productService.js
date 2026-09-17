import seedProducts from '../data/products.json';
import { query } from './mockDb';
import { simulate } from './apiClient';
import { ApiError, ERR } from './errors';

/** Merge static catalog data with live inventory from the mock backend. */
const withStock = (p, inventory) => ({ ...p, stock: inventory[p.id] ?? p.stock });

export function getLiveProduct(id) {
  const p = seedProducts.find((x) => x.id === id);
  return p ? query((db) => withStock(p, db.inventory)) : null;
}

export const productService = {
  /**
   * @param {{search?: string, category?: string, minPrice?: number, maxPrice?: number,
   *          availability?: 'all'|'in'|'out', sort?: string}} filters
   */
  list: (filters = {}) =>
    simulate(() => {
      const { search = '', category = '', minPrice, maxPrice, availability = 'all', sort = 'relevance' } = filters;
      const term = search.trim().toLowerCase();
      let items = query((db) => seedProducts.map((p) => withStock(p, db.inventory)));
      if (term) items = items.filter((p) => p.name.toLowerCase().includes(term));
      if (category) items = items.filter((p) => p.category === category);
      if (minPrice !== undefined && minPrice !== '') items = items.filter((p) => p.price >= Number(minPrice));
      if (maxPrice !== undefined && maxPrice !== '') items = items.filter((p) => p.price <= Number(maxPrice));
      if (availability === 'in') items = items.filter((p) => p.stock > 0);
      if (availability === 'out') items = items.filter((p) => p.stock === 0);
      const sorters = {
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        rating: (a, b) => b.rating - a.rating,
      };
      if (sorters[sort]) items = [...items].sort(sorters[sort]);
      return items;
    }),

  getById: (id) =>
    simulate(() => {
      const p = getLiveProduct(id);
      if (!p) throw new ApiError('Product not found.', ERR.NOT_FOUND, 404);
      return p;
    }),
};
