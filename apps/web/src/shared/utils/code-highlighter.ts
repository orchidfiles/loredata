import { codeToHtml } from 'shiki';

const codeTheme = 'one-dark-pro';

export class CodeHighlighter {
	public static async getHtml(code: string, language: 'ts' | 'bash' | 'json'): Promise<string> {
		const html = await codeToHtml(code, {
			lang: language,
			theme: codeTheme
		});

		return html;
	}
}
