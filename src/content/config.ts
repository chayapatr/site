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

const s = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		main: z.boolean().default(false),
		pubDate: z.coerce.date().optional(),
	}),
});

export const collections = { s };
