import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRole } from '@/lib/crudFunctions/Role';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { staffId } = req.query;

  if (req.method === 'GET') {
    try {
      const role = await getUserRole(Number(staffId));
      res
        .status(role ? 200 : 404)
        .json(role || { error: 'User role not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user role' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
