import type { SourceConfig } from './types';

export const SOURCE_MAP: Record<string, SourceConfig> = {
	'game-of-thrones': {
		rawUrls: [
			'https://en.wikiquote.org/w/index.php?title=Game_of_Thrones/Season_1&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Game_of_Thrones/Season_2&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Game_of_Thrones/Season_3&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Game_of_Thrones/Season_4&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Game_of_Thrones/Season_5&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Game_of_Thrones/Season_6&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Game_of_Thrones/Season_7&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Game_of_Thrones/Season_8&action=raw',
			'https://en.wikiquote.org/w/index.php?title=A_Song_of_Ice_and_Fire&action=raw'
		],
		aliases: {
			'jon-snow': ['jon snow', 'jon'],
			'daenerys-targaryen': ['daenerys', 'danerys', 'daenerys targaryen', 'danerys targaryen', 'khaleesi'],
			'tyrion-lannister': ['tyrion', 'tyrion lannister'],
			'cersei-lannister': ['cersei', 'cersei lannister'],
			'arya-stark': ['arya', 'arya stark'],
			'ned-stark': ['eddard', 'eddard stark', 'ned stark'],
			'sansa-stark': ['sansa', 'sansa stark'],
			ygritte: ['ygritte'],
			'jaime-lannister': ['jaime', 'jaime lannister'],
			'bran-stark': ['bran', 'bran stark'],
			'joffrey-baratheon': ['joffrey', 'joffrey baratheon'],
			'petyr-baelish': ['petyr baelish', 'littlefinger'],
			'the-hound': ['sandor clegane', 'the hound'],
			'samwell-tarly': ['samwell', 'samwell tarly', 'sam'],
			melisandre: ['melisandre', 'melissandre']
		},
		knownCatchphrases: {}
	},
	'the-crown': {
		rawUrls: [
			'https://en.wikiquote.org/w/index.php?title=The_Crown_(season_1)&action=raw',
			'https://en.wikiquote.org/w/index.php?title=The_Crown_(season_2)&action=raw',
			'https://en.wikiquote.org/w/index.php?title=The_Crown_(season_3)&action=raw',
			'https://en.wikiquote.org/w/index.php?title=The_Crown_(season_4)&action=raw',
			'https://en.wikiquote.org/w/index.php?title=The_Crown_(season_5)&action=raw',
			'https://en.wikiquote.org/w/index.php?title=The_Crown_(season_6)&action=raw'
		],
		aliases: {
			'queen-elizabeth-ii': ['elizabeth', 'queen elizabeth', 'queen elizabeth ii', 'lilibet'],
			'prince-philip': ['philip', 'prince philip', 'duke of edinburgh'],
			'prince-charles': ['charles', 'prince charles', 'charles, prince of wales', 'king charles'],
			'princess-diana': ['diana', 'princess diana', 'diana, princess of wales'],
			'princess-margaret': ['margaret', 'princess margaret'],
			'winston-churchill': ['winston', 'winston churchill', 'churchill'],
			'camilla-parker-bowles': ['camilla', 'camilla parker bowles', 'camilla shand']
		},
		knownCatchphrases: {
			'prince-charles': ['Whatever in love means.']
		}
	},
	'stranger-things': {
		rawUrls: [
			'https://en.wikiquote.org/w/index.php?title=Stranger_Things/Season_1&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Stranger_Things/Season_2&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Stranger_Things/Season_3&action=raw',
			'https://en.wikiquote.org/w/index.php?title=Stranger_Things/Season_4&action=raw'
		],
		aliases: {
			eleven: ['eleven', 'el', 'jane'],
			'mike-wheeler': ['mike', 'mike wheeler'],
			'dustin-henderson': ['dustin', 'dustin henderson'],
			'lucas-sinclair': ['lucas', 'lucas sinclair'],
			'will-byers': ['will', 'will byers'],
			'joyce-byers': ['joyce', 'joyce byers'],
			'jim-hopper': ['hopper', 'jim hopper', 'chief hopper']
		},
		knownCatchphrases: {
			eleven: ["Friends don't lie."],
			'jim-hopper': ['Mornings are for coffee and contemplation.']
		}
	},
	vikings: {
		rawUrls: ['https://en.wikiquote.org/w/index.php?title=Vikings_(2013_TV_series)&action=raw'],
		aliases: {
			'ragnar-lothbrok': ['ragnar', 'ragnar lothbrok', 'ragnar lodbrok'],
			lagertha: ['lagertha'],
			'bjorn-ironside': ['bjorn', 'bjorn ironside', 'bjorn ragnarsson'],
			rollo: ['rollo', 'hrolfo'],
			floki: ['floki'],
			athelstan: ['athelstan'],
			'queen-aslaug': ['aslaug', 'queen aslaug']
		},
		knownCatchphrases: {
			'ragnar-lothbrok': ['Power is only given to those who are prepared to lower themselves to pick it up.'],
			lagertha: ['All lives are stories.'],
			floki: ["I build boats, Ragnar. You're the navigator."],
			'queen-aslaug': ['I spoke them, but the gods chose them.']
		}
	},
	'the-witcher': {
		rawUrls: ['https://en.wikiquote.org/w/index.php?title=The_Witcher_(TV_series)&action=raw'],
		aliases: {
			'geralt-of-rivia': ['geralt', 'geralt of rivia', 'the witcher', 'white wolf'],
			yennefer: ['yennefer', 'yennefer of vengerberg', 'yen'],
			ciri: ['ciri', 'cirilla', 'cirilla fiona elen riannon', 'princess cirilla'],
			dandelion: ['jaskier', 'dandelion', 'julian'],
			'triss-merigold': ['triss', 'triss merigold'],
			vesemir: ['vesemir'],
			cahir: ['cahir', 'cahir mawr dyffryn aep ceallach'],
			vilgefortz: ['vilgefortz', 'vilgefortz of roggeveen']
		},
		knownCatchphrases: {
			'geralt-of-rivia': ['Evil is evil. Lesser, greater, middling. Makes no difference.'],
			dandelion: ['Toss a coin to your Witcher.']
		}
	}
};
