/** @type {import('next').NextConfig} */
const config = {
  webpack: (config) => {
    // Ensure the pdf.worker.js file is served from a public URL
    config.resolve.alias.canvas = false;
    
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]'
      },
    });

    return config;
  },
  // Add transpilePackages to handle pdf.js properly
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
};

export default config;