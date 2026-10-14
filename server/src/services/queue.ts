import PQueue from 'p-queue';

// Single concurrency queue with rate-limiting to protect VPS memory and marketplace rate limits
export const publishQueue = new PQueue({
  concurrency: 1,
  interval: 1000,
  intervalCap: 2
});

publishQueue.on('active', () => {
  console.log(`[Queue] Task active. Size: ${publishQueue.size}, Pending: ${publishQueue.pending}`);
});

publishQueue.on('idle', () => {
  console.log('[Queue] All publishing jobs completed.');
});
