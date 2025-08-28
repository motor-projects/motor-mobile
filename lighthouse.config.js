module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Performance-only audit mode for mobile app testing
    onlyCategories: ['performance', 'accessibility'],
    // Custom throttling for mobile testing
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    // Custom form factors
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
  },
  audits: [
    // Core Web Vitals
    'largest-contentful-paint',
    'first-contentful-paint',
    'cumulative-layout-shift',
    'total-blocking-time',
    
    // Performance audits
    'speed-index',
    'interactive',
    'mainthread-work-breakdown',
    'bootup-time',
    'uses-long-cache-ttl',
    'total-byte-weight',
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'uses-optimized-images',
    'uses-text-compression',
    'uses-responsive-images',
    'efficient-animated-content',
    'preload-lcp-image',
    
    // Accessibility audits
    'color-contrast',
    'image-alt',
    'label',
    'link-name',
    'button-name',
    'focus',
    'tabindex',
    'heading-order',
    'duplicate-id',
    
    // Custom mobile-specific audits
    'viewport',
    'without-javascript',
    'is-on-https',
  ],
  categories: {
    performance: {
      title: 'Performance',
      auditRefs: [
        { id: 'first-contentful-paint', weight: 10 },
        { id: 'largest-contentful-paint', weight: 25 },
        { id: 'speed-index', weight: 10 },
        { id: 'interactive', weight: 10 },
        { id: 'total-blocking-time', weight: 30 },
        { id: 'cumulative-layout-shift', weight: 15 },
      ],
    },
    accessibility: {
      title: 'Accessibility',
      description: 'These checks highlight opportunities to improve the accessibility of your app.',
      auditRefs: [
        { id: 'color-contrast', weight: 1 },
        { id: 'image-alt', weight: 1 },
        { id: 'label', weight: 1 },
        { id: 'link-name', weight: 1 },
        { id: 'button-name', weight: 1 },
      ],
    },
  },
}