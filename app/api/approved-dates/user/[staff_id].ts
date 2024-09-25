import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserApprovedDates } from '@/lib/crudFunctions/ApprovedDates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { staff_id } = req.query;

  if (req.method === 'GET') {
    try {
      const approvedDates = await getUserApprovedDates(Number(staff_id));
      if (approvedDates) {
        res.status(200).json(approvedDates);
      } else {
        res
          .status(404)
          .json({ error: 'No approved dates found for this user' });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to fetch approved dates for the user' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
