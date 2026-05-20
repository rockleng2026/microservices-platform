module.exports = {
  ci: {
    collection: {
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/pages/product-list/index',
        'http://localhost:5173/pages/product-detail/index',
      ],
      preset: 'perf',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.6 }],
        'categories:accessibility': ['error', { minScore: 0.7 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.15 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};