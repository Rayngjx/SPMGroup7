import type { NextApiRequest, NextApiResponse } from 'next';
import { updateRequest, deleteRequest } from '@/lib/crudFunctions/Requests';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { request_id } = req.query;

  if (req.method === 'PUT') {
    try {
      const payload = { ...req.body, request_id: Number(request_id) };
      const result = await updateRequest(payload);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update request' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await deleteRequest(Number(request_id));
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete request' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
