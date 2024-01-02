import { defineCollection, z } from 'astro:content';

// const blog = defineCollection({
// 	type: 'content',
// 	// Type-check frontmatter using a schema
// 	schema: z.object({
// 		title: z.string(),
// 		description: z.string(),
// 		// Transform string to Date object
// 		pubDate: z.coerce.date(),
// 		updatedDate: z.coerce.date().optional(),
// 		heroImage: z.string().optional(),
// 	}),
// });

const g = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		main: z.boolean().default(false),
		pubDate: z.coerce.date(),
		// index: z.boolean().default(false),
		freestyle: z.boolean().default(false),
	}),
});

export const collections = { g };
