import type { NextApiRequest, NextApiResponse } from 'next';
import { getRole, updateRole, deleteRole } from '@/lib/crudFunctions/Role';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { roleId } = req.query;

  if (req.method === 'GET') {
    try {
      const role = await getRole(Number(roleId));
      res.status(role ? 200 : 404).json(role || { error: 'Role not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch role' });
    }
  } else if (req.method === 'PUT') {
    try {
      const payload = { ...req.body, role_id: Number(roleId) }; // Include role_id in the payload
      const response = await updateRole(payload);
      res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update role' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const response = await deleteRole(Number(roleId));
      res.status(response.success ? 204 : 400).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete role' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
