import type { NextApiRequest, NextApiResponse } from 'next';
import {
  updateWithdrawRequest,
  deleteWithdrawRequest
} from '@/lib/crudFunctions/WithdrawRequests';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { withdrawRequestId } = req.query;

  if (req.method === 'PUT') {
    try {
      const payload = {
        ...req.body,
        withdraw_request_id: Number(withdrawRequestId)
      };
      const response = await updateWithdrawRequest(payload);
      res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update withdraw request' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const response = await deleteWithdrawRequest(Number(withdrawRequestId));
      res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete withdraw request' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
