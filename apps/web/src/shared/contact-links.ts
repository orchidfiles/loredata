export interface ContactLink {
	name: string;
	href: string;
	value: string;
	external?: boolean;
}

export const contactLinks: ContactLink[] = [
	{
		name: 'Blog',
		href: 'https://orchidfiles.com',
		value: 'orchidfiles.com',
		external: true
	},
	{
		name: 'Email',
		href: 'mailto:orchid@orchidfiles.com',
		value: 'orchid@orchidfiles.com'
	},
	{
		name: 'Telegram',
		href: 'https://t.me/askorchid',
		value: '@askorchid',
		external: true
	},
	{
		name: 'X',
		href: 'https://x.com/orchidcode',
		value: '@orchidcode',
		external: true
	}
];
