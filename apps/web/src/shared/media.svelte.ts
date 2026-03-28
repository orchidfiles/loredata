import { MediaQuery } from 'svelte/reactivity';

const mobileQuery = new MediaQuery('max-width: 639px');

export const isMobile = {
	get current() {
		return mobileQuery.current;
	}
};
