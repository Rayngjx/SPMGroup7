import type { NextApiRequest, NextApiResponse } from 'next';
import { createLog } from '@/lib/crudFunctions/Logs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const log = await createLog(req.body);
      res.status(200).json(log);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create log entry' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
