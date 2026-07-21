import 'dotenv/config';

import { db } from '../src/lib/db';

async function main() {
  const [departmentCount, userCount, projectCount, taskCount] =
    await Promise.all([
      db.department.count(),
      db.user.count(),
      db.project.count(),
      db.task.count(),
    ]);

  console.table({
    departments: departmentCount,
    users: userCount,
    projects: projectCount,
    tasks: taskCount,
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
