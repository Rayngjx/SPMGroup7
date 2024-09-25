import type { NextApiRequest, NextApiResponse } from 'next';
import { getStaffLogs } from '@/lib/crudFunctions/Logs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { staffId } = req.query;

  if (req.method === 'GET') {
    try {
      const logs = await getStaffLogs(Number(staffId));
      if (logs) {
        res.status(200).json(logs);
      } else {
        res.status(404).json({ error: 'No logs found for this staff member' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch logs for staff member' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
