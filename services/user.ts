import { db } from '@/lib/db';
import { registerSchema } from '@/schemas';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.users.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (staff_id: number) => {
  try {
    const user = await db.users.findUnique({ where: { staff_id } });

    return user;
  } catch {
    return null;
  }
};

// export const createUser = async (payload: z.infer<typeof registerSchema>) => {
//   try {
//     return await db.users.create({
//       data: payload,
//     });
//   } catch {
//     return null;
//   }
// };

type UpdateUserType = Prisma.Args<typeof db.users, 'update'>['data'];
export const updateUserById = async (
  staff_id: number,
  payload: UpdateUserType
) => {
  try {
    return await db.users.update({
      where: { staff_id },
      data: payload
    });
  } catch {
    return null;
  }
};
