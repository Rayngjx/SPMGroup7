import type { NextApiRequest, NextApiResponse } from 'next';
import { getRequests, createRequest } from '@/lib/crudFunctions/Requests';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const requests = await getRequests();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  } else if (req.method === 'POST') {
    try {
      const payload = req.body;
      const result = await createRequest(payload);
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to create request' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
