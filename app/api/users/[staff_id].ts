import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser, updateUser, deleteUser } from '@/lib/crudFunctions/Staff';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { staffId } = req.query;

  if (req.method === 'GET') {
    try {
      const user = await getUser(Number(staffId));
      res.status(user ? 200 : 404).json(user || { error: 'User not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  } else if (req.method === 'PUT') {
    try {
      const payload = { ...req.body, staff_id: Number(staffId) }; // Include staff_id in the payload
      const response = await updateUser(payload);
      res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const response = await deleteUser(Number(staffId));
      res.status(response.success ? 204 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
