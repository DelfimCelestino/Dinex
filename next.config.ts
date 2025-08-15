import withPWA from "next-pwa";

const withPWAPlugin = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith("/images/uploads/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "uploads-images",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
  ],
});

const baseConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuração para servir arquivos estáticos corretamente
  output: 'standalone' as const,
  outputFileTracingRoot: process.cwd(),
  // Configurações para evitar warnings do Webpack
  webpack: (config: any, { isServer, dev }: any) => {
    // Otimizações para produção
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Reduzir warnings em desenvolvimento
    if (dev) {
      config.stats = 'errors-only';
    }
    
    return config;
  },
  // Configurações para reduzir warnings
  poweredByHeader: false,
  compress: true,
  // Garantir que arquivos estáticos sejam servidos
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withPWAPlugin(baseConfig);
