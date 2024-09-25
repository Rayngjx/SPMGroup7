import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getWithdrawRequests,
  createWithdrawRequest
} from '@/lib/crudFunctions/WithdrawRequests';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const response = await getWithdrawRequests();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch withdraw requests' });
    }
  } else if (req.method === 'POST') {
    try {
      const payload = req.body;
      const response = await createWithdrawRequest(payload);
      res.status(response.success ? 201 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create withdraw request' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
