/** @type {import('next').NextConfig} */
const nextConfig = {
  /* the daily questions moved to the front page; old links still land right */
  redirects: async () => [{ source: "/daily", destination: "/", permanent: true }],
};

export default nextConfig;
