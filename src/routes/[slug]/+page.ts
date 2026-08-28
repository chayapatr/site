import { redirect } from '@sveltejs/kit';

// visiting /some-note directly redirects to /?page=some-note — the root
// page is the only one that actually renders content, this route just
// exists so a bare slug URL (e.g. shared from an internal link) works
export const load = ({ params }) => {
	throw redirect(307, `/?page=${encodeURIComponent(params.slug)}`);
};
