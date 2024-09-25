import type { NextApiRequest, NextApiResponse } from 'next';
import { getLogs } from '@/lib/crudFunctions/Logs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const logs = await getLogs();
      if (logs) {
        res.status(200).json(logs);
      } else {
        res.status(404).json({ error: 'No logs found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
