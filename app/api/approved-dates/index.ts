import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getApprovedDates,
  createApproveDates
} from '@/lib/crudFunctions/ApprovedDates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const dates = await getApprovedDates();
      res.status(200).json(dates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch approved dates' });
    }
  } else if (req.method === 'POST') {
    try {
      const payload = req.body;
      const result = await createApproveDates(payload);
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to create approved date' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
