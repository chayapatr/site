<script lang="ts">
	import { micromark } from 'micromark';
	import { gfmTable, gfmTableHtml } from 'micromark-extension-gfm-table';

	const output = micromark(
		`
| Name                                                                                                                                        | Date                | Venue                         |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------- |
| [CAT T-SHIRT 6](http://www.thisiscat.com/event/detail/19393)                                                                                | 1-2 July 2019       | ARL Makkasan                  |
| [VERY LIVE Present JOJI: SMITHEREENS TOUR LIVE IN BANGKOK 2022](https://www.ticketmelon.com/very/verylivejoji)                              | 8 December 2022     | Thunderdome Muang Thong Thani |
| [AURORA BRINGS THE GODS WE CAN TOUCH TOUR 2023](https://www.thaiticketmajor.com/concert/aurora-brings-the-gods-we-can-touch-tour-2023.html) | 23 February 2023    | Central World Live            |
| [Diage Festival 2023](https://groundcontrolth.com/blogs/diage-festival-2023)                                                                | 11-12 November 2023 | Show DC                       |
`,
		{
			extensions: [gfmTable()],
			htmlExtensions: [gfmTableHtml()]
		}
	);
</script>

<div class="p-6 text-white">
	{@html output}
</div>
