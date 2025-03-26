
import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
  distDir: '.next',
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);