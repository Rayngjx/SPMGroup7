import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteLog } from '@/lib/crudFunctions/Logs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { log_id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const result = await deleteLog(Number(log_id));
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete log entry' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
