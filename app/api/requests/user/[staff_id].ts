import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRequests } from '@/lib/crudFunctions/Requests';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { staff_id } = req.query;

  if (req.method === 'GET') {
    try {
      const requests = await getUserRequests(Number(staff_id));
      if (requests) {
        res.status(200).json(requests);
      } else {
        res.status(404).json({ error: 'No requests found for the user' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user requests' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
