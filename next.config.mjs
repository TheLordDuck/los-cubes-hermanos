/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		missingSuspenseWithCSRBailout: false,
	  },
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cards.scryfall.io",
				pathname: "**",
			},
		],
	},
};

export default nextConfig;
