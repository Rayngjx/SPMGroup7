import type { NextApiRequest, NextApiResponse } from 'next';
import {
  updateApproveDates,
  deleteApproveDates
} from '@/lib/crudFunctions/ApprovedDates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { staff_id } = req.query;

  if (req.method === 'PUT') {
    try {
      const payload = { ...req.body, staff_id: Number(staff_id) };
      const result = await updateApproveDates(payload);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update approved date' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const payload = { ...req.body, staff_id: Number(staff_id) };
      const result = await deleteApproveDates(payload);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete approved date' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
