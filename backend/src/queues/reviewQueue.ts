import { Queue } from 'bullmq';

export const queue = new Queue('review', {
	connection: {
		host: 'localhost',
		port: 6379
	}
});

