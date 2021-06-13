/** @type {import('snowpack').SnowpackUserConfig} */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
    in: { url: '/in', static: true, resolve: false },
  },
  plugins: [
    '@snowpack/plugin-typescript',
  ],
};
