import type { NextApiRequest, NextApiResponse } from 'next';
import { updateLog } from '@/lib/crudFunctions/Logs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PUT') {
    try {
      const log = await updateLog(req.body);
      res.status(200).json(log);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update log entry' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
