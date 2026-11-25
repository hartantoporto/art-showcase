const nextConfig = {
    serverExternalPackages: ['pg'],
    experimental: { serverActions: { bodySizeLimit: '20mb' } },
};
export default nextConfig;

