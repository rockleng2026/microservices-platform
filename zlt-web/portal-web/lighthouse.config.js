module.exports = {
  ci: {
    collection: {
      url: [
        'http://localhost:8001/dashboard',
        'http://localhost:8001/mall-admin/goods',
        'http://localhost:8001/mall-admin/orders',
      ],
      preset: 'desktop',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};