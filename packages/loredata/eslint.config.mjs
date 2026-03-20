import base from '@loredata/dev-kit/eslint';

export default [
	...base,
	{
		settings: {
			'import-x/internal-regex': '^(@loredata|src)(/|$)'
		},
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname
			}
		}
	}
];
