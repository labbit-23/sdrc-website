/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/about.php', destination: '/about', permanent: true },
      { source: '/services.php', destination: '/services', permanent: true },
      { source: '/packages.php', destination: '/packages', permanent: true },
      { source: '/packages-prev.php', destination: '/packages', permanent: true },
      { source: '/packages_prev.php', destination: '/packages', permanent: true },
      { source: '/contact.php', destination: '/contact', permanent: true },
      { source: '/accreditation.php', destination: '/accreditation', permanent: true },
      { source: '/physiotherapy.php', destination: '/physiotherapy', permanent: true },
      { source: '/privacy-policy.php', destination: '/privacy-policy', permanent: true }
    ];
  }
};

export default nextConfig;
