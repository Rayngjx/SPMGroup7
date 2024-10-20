import { users } from '@prisma/client';

// userService.js
export async function getUser(userId: users['staff_id']) {
  const response = await fetch(
    `http://localhost:3000/api/users?staff_id=${userId}`
  );
  const user = await response.json();
  return user;
}

export async function checkIfSeniorManagementOrHR(userId: users['staff_id']) {
  const user = await getUser(userId);
  return user.role_id === 1 || user.department === 'HR';
}

export async function checkIfStaff(userId: users['staff_id']) {
  const user = await getUser(userId);
  return user.role_id === 2;
}

export async function checkIfManager(userId: users['staff_id']) {
  const user = await getUser(userId);
  return user.role_id === 3;
}
