import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getWithdrawnDates,
  createWithdrawnDates
} from '@/lib/crudFunctions/WithdrawnDates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const response = await getWithdrawnDates();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch withdrawn dates' });
    }
  } else if (req.method === 'POST') {
    try {
      const payload = req.body;
      const response = await createWithdrawnDates(payload);
      res.status(response.success ? 201 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create withdrawn date entry' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
