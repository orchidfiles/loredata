export interface Address {
	street?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
}

export interface Person {
	id: string;
	characterId: string;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
	phone: string;
	address: Address;
	profession: string;
	interests: string[];
	quote: string;
	universe: string;
	universeName: string;
	avatar: string;
}
