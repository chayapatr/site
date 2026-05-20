export type ProjectType = 'Art & Design' | 'Media' | 'Community' | 'Research' | 'Engineering';
export type Project = {
	month: string;
	title: string;
	image: string;
	types: ProjectType[];
	size?: '2x1' | '2x2';
};
export type ProjectYear = { year: number; projects: Project[] };

export const projects: ProjectYear[] = [
	{
		year: 2026,
		projects: [
			{
				month: 'Jun',
				title: 'Death of the Chatbot',
				image: 'deathofthechatbot.webp',
				types: ['Research']
			},
			{
				month: 'May',
				title: 'Map of music and other humanly organized sound',
				image: 'music.webp',
				types: ['Art & Design', 'Engineering'],
				size: '2x1'
			},
			{
				month: 'May',
				title: 'Between Us and Utopia',
				image: 'utopia.webp',
				types: ['Art & Design']
			},
			{
				month: 'Apr',
				title: 'Open Benchmark for AI Impacts on Humans',
				image: 'benchmark.webp',
				types: ['Research', 'Engineering'],
				size: '2x2'
			},
			{
				month: 'Apr',
				title: 'Anthology',
				image: 'anthology.webp',
				types: ['Research', 'Engineering']
			},
			{
				month: 'Jan',
				title: 'Selves Portrait',
				image: 'portrait.webp',
				types: ['Art & Design', 'Engineering']
			}
		]
	},
	{
		year: 2025,
		projects: [
			{
				month: 'Dec',
				title: 'AI Wrapped',
				image: 'aiwrapped.webp',
				types: ['Engineering', 'Research']
			},
			{
				month: 'Dec',
				title: 'Thinking about thinking about memories',
				image: 'thinkingabout.webp',
				types: ['Art & Design']
			},
			{
				month: 'Oct',
				title: 'Common',
				image: 'common.webp',
				types: ['Art & Design', 'Engineering']
			},
			{
				month: 'Sep',
				title: 'Simulating Psychorisk',
				image: 'psychorisk.webp',
				types: ['Research'],
				size: '2x1'
			},
			{ month: 'Sep', title: 'Future You', image: 'futureyou.webp', types: ['Research'] },
			{
				month: 'Aug',
				title: 'Cyborg Psychology',
				image: 'cyborg.webp',
				types: ['Research', 'Engineering']
			},
			{ month: 'Aug', title: 'Borg', image: 'borg.webp', types: ['Engineering'] },
			{ month: 'Nov', title: 'Simulating Wellbeing', image: 'wellbeing.webp', types: ['Research'] },
			{
				month: 'May',
				title: 'A Conversation with Aliens',
				image: 'alien.webp',
				types: ['Art & Design', 'Community']
			},
			{
				month: 'May',
				title: "Netflix's Mad Unicorn",
				image: 'madunicorn.webp',
				types: ['Media', 'Engineering'],
				size: '2x2'
			},
			{
				month: 'Apr',
				title: 'Atlas of Human-AI Interaction',
				image: 'atlas.webp',
				types: ['Research'],
				size: '2x2'
			},
			{ month: 'Apr', title: 'False Memory', image: 'falsememories.webp', types: ['Research'] },
			{
				month: 'Feb',
				title: 'Dataset Marketplace',
				image: 'dataset.webp',
				types: ['Art & Design', 'Community']
			}
		]
	},
	{
		year: 2024,
		projects: [
			{
				month: 'Sep',
				title: 'On Digital Gardening',
				image: 'digitalgarden.webp',
				types: ['Research']
			},
			{
				month: 'Apr',
				title: 'A Bit of Thai Tunes',
				image: 'abit.webp',
				types: ['Community', 'Art & Design'],
				size: '2x1'
			},
			{
				month: 'Mar',
				title: 'Cyber Subin',
				image: 'Frame 159.webp',
				types: ['Art & Design', 'Research'],
				size: '2x2'
			},
			{
				month: 'Feb',
				title: 'Phylogenetic Tree of Dance',
				image: 'phylogenetic.webp',
				types: ['Art & Design', 'Research']
			},
			{
				month: 'Jan',
				title: 'Redesigning Human Extinction',
				image: 'extinction.webp',
				types: ['Art & Design', 'Community']
			}
		]
	},
	{
		year: 2023,
		projects: [
			{
				month: 'Feb',
				title: 'Bangkok Open Source Hackathon',
				image: 'bangkokopensource.webp',
				types: ['Community']
			},
			{ month: 'Feb', title: 'Chasing New Horizons', image: 'chasing.webp', types: ['Media'] }
		]
	},
	{
		year: 2022,
		projects: [
			{ month: 'Aug', title: 'Codegolf Party', image: 'bkkjs.webp', types: ['Community'] },
			{ month: 'Aug', title: 'Scisart Night', image: 'scisart.webp', types: ['Community'] },
			{
				month: 'Jun',
				title: 'Creatorsgarten',
				image: 'creatorsgarten.webp',
				types: ['Community'],
				size: '2x1'
			},
			{
				month: 'Jul',
				title: 'Stupid Hackathon Thailand',
				image: 'stupidhack.webp',
				types: ['Community', 'Engineering']
			},
			{
				month: 'Jun',
				title: 'AI Space Challenge',
				image: 'aispace.webp',
				types: ['Engineering', 'Community']
			},
			{
				month: 'May',
				title: 'Biological Aesthetics of Nature',
				image: 'bio.webp',
				types: ['Community']
			},
			{
				month: 'Mar',
				title: 'How to Learn Almost Anything',
				image: 'learn.webp',
				types: ['Community']
			}
		]
	},
	{
		year: 2021,
		projects: [
			{
				month: 'Oct',
				title: 'Recursive Sans Thai',
				image: 'recursive.webp',
				types: ['Art & Design']
			},
			{ month: 'Oct', title: 'ThaiPBS: Starstuff', image: 'starstuff.webp', types: ['Media'] },
			{ month: 'Mar', title: 'TEDxUTCC', image: 'ted.webp', types: ['Community'] }
		]
	},
	{
		year: 2020,
		projects: [
			{
				month: 'Feb',
				title: 'Forgotten',
				image: 'forgotten.webp',
				types: ['Art & Design'],
				size: '2x1'
			},
			{
				month: 'Oct',
				title: 'MESSE',
				image: 'messe.webp',
				types: ['Art & Design', 'Engineering', 'Research'],
				size: '2x2'
			}
		]
	},
	{
		year: 2019,
		projects: [{ month: 'Jul', title: 'Spaceth', image: 'spaceth.webp', types: ['Media'] }]
	}
];
