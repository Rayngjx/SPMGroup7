import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserWithdrawnDates } from '@/lib/crudFunctions/WithdrawnDates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { staffId } = req.query;

  if (req.method === 'GET') {
    try {
      const response = await getUserWithdrawnDates(Number(staffId));
      res
        .status(response ? 200 : 404)
        .json(response || { error: 'No withdrawn dates found for user' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user withdrawn dates' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
