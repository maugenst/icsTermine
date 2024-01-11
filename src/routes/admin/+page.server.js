import { error } from '@sveltejs/kit';
import config from 'config';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const copy = config.util.toObject(config);

    if (copy) {
        return copy;
    }

    throw error(404, 'Not found');
}