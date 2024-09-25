import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers, createUser } from '@/lib/crudFunctions/Staff';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const users = await getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    try {
      const payload = req.body; // Make sure to validate the payload
      const response = await createUser(payload);
      res.status(response.success ? 201 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
