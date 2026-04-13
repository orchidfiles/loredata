import { RenderCore, type FontData, type RenderJob } from './render-core';

let fonts: FontData | null = null;

async function handleMessage(msg: { id: number; job: RenderJob }): Promise<void> {
	try {
		fonts ??= await RenderCore.loadFonts();

		const buf = await RenderCore.renderToPng(msg.job, fonts);

		if (process.send === undefined) {
			return;
		}

		process.send({ id: msg.id, ok: true, data: buf.toString('base64') });
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);

		if (process.send === undefined) {
			return;
		}

		process.send({ id: msg.id, ok: false, err: message });
	}
}

process.on('message', (msg: { id: number; job: RenderJob }) => {
	void handleMessage(msg);
});
