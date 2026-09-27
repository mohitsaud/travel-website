import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.65'],
  async headers() {
    const developmentScriptPolicy =
      process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${developmentScriptPolicy}; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
