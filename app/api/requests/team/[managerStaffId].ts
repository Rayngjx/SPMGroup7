import type { NextApiRequest, NextApiResponse } from 'next';
import { getTeamRequests } from '@/lib/crudFunctions/Requests';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { managerStaffId } = req.query;

  if (req.method === 'GET') {
    try {
      const requests = await getTeamRequests(Number(managerStaffId));
      if (requests) {
        res.status(200).json(requests);
      } else {
        res
          .status(404)
          .json({ error: 'No team requests found for this manager' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch team requests' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
