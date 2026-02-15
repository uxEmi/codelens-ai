import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const worker = new Worker('review', async (job) => {
  console.log('Processing job:', job.id);
  
  const { reviewId, code } = job.data;
  
  await prisma.review.update({
  	where: {id: reviewId},
	data: {status: 'processing'}
  });

  console.log('Processing.....');
  const response = await fetch('http://localhost:8000/analyze', {	
  	method: 'POST',
  	headers: { 'Content-Type': 'application/json' },
  	body: JSON.stringify({ code })
  });

  const data = await response.json();

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: 'done',result: data.result }
  });
  
  console.log('Job done:', reviewId);
}, {
  connection: {
    host: 'localhost',
    port: 6379
  }
});
