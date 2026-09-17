// `image` is a representative product photo used on category tiles.
export const CATEGORIES = [
  { id: 'kitchen', name: 'Kitchen', color: '#2f8f83', image: 'https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/thumbnail.webp' },
  { id: 'appliances', name: 'Appliances', color: '#5b6fd6', image: 'https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/thumbnail.webp' },
  { id: 'dining', name: 'Dining', color: '#e59a2f', image: 'https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/thumbnail.webp' },
  { id: 'decor', name: 'Home Décor', color: '#c4556b', image: 'https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/thumbnail.webp' },
  { id: 'furniture', name: 'Furniture', color: '#8a6a4f', image: 'https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp' },
  { id: 'essentials', name: 'Essentials', color: '#7a8a3a', image: 'https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/thumbnail.webp' },
];

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
