// __tests__/testUtils.ts
import { db } from '@/lib/db';

export const resetDatabase = async () => {
  await db.requests.deleteMany({});
  // Repeat this line for other tables as needed
};
