export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  vite: {
    server: {
        proxy: {
            '/api': {
                target: process.env.PROXY_URL,
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, '')
          }
      }
    },
},
  devServer: {
    https: {
      key: './server.key',
      cert: './server.crt'
    }
  },
  app: {
    baseURL: process.env.BASEURL,
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  modules: ['@vite-pwa/nuxt', '@nuxtjs/google-adsense', '@nuxtjs/tailwindcss', '@unlok-co/nuxt-stripe', '@nuxtjs/color-mode'],
  stripe: {
    // Server
    server: {
      key: "sk_test_123",
      options: {
        // your api options override for stripe server side
        // https://github.com/stripe/stripe-node?tab=readme-ov-file#configuration
      },
      // CLIENT
    },
    client: {
      key: process.env.STRIPE_KEY,
      // your api options override for stripe client side https://stripe.com/docs/js/initializing#init_stripe_js-options
      options: {},
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'White Noise Generator',
      short_name: 'White Noise',
      description: 'A random white noise generator for sleep and work.',
      theme_color: '#000000',
      
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },

    registerWebManifestInRouteRules: true,

    client: {
      periodicSyncForUpdates: 3600,
      installPrompt: true,
    },
  }
})