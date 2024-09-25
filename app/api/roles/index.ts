import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoles, createRole } from '@/lib/crudFunctions/Role';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const roles = await getRoles();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  } else if (req.method === 'POST') {
    try {
      const payload = req.body; // Make sure to validate the payload
      const response = await createRole(payload);
      res.status(response.success ? 201 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create role' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
