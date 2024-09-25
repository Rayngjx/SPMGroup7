import type { NextApiRequest, NextApiResponse } from 'next';
import { getRequestLogs } from '@/lib/crudFunctions/Logs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { requestId } = req.query;

  if (req.method === 'GET') {
    try {
      const logs = await getRequestLogs(Number(requestId));
      if (logs) {
        res.status(200).json(logs);
      } else {
        res.status(404).json({ error: 'No logs found for this request' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch logs for request' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
