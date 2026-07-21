import 'dotenv/config';

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured.');
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const DEPARTMENTS = [
  {
    name: 'Chuyển đổi số',
    description: 'Phát triển hệ thống và triển khai chuyển đổi số.',
  },
  {
    name: 'Chuyên môn',
    description: 'Xây dựng và quản lý chương trình chuyên môn.',
  },
  {
    name: 'STEAM',
    description: 'Tổ chức hoạt động và chương trình giáo dục STEAM.',
  },
  {
    name: 'Truyền thông',
    description: 'Quản lý nội dung, hình ảnh và hoạt động truyền thông.',
  },
  {
    name: 'Chăm sóc khách hàng',
    description: 'Tiếp nhận và hỗ trợ phụ huynh, học sinh và đối tác.',
  },
  {
    name: 'Hành chính',
    description: 'Điều phối công tác hành chính nội bộ.',
  },
  {
    name: 'Nhân sự',
    description: 'Quản lý hồ sơ và hoạt động nhân sự.',
  },
  {
    name: 'Tài chính',
    description: 'Quản lý tài chính, kế toán và chứng từ.',
  },
  {
    name: 'Cơ sở vật chất',
    description: 'Quản lý trang thiết bị và cơ sở vật chất.',
  },
  {
    name: 'Chất lượng',
    description: 'Kiểm soát chất lượng và hoạt động đánh giá.',
  },
] as const;

async function seedDepartments() {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: {
        name: department.name,
      },
      update: {
        description: department.description,
      },
      create: department,
    });
  }
}

async function seedUsers() {
  const department = await prisma.department.findUniqueOrThrow({
    where: {
      name: 'Chuyển đổi số',
    },
  });

  const [adminPassword, managerPassword, memberPassword] = await Promise.all([
    bcrypt.hash('Admin@123', 12),
    bcrypt.hash('Manager@123', 12),
    bcrypt.hash('Member@123', 12),
  ]);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@lydinc.local',
    },
    update: {
      name: 'LYDINC Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: department.id,
    },
    create: {
      name: 'LYDINC Administrator',
      email: 'admin@lydinc.local',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: department.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: {
      email: 'manager@lydinc.local',
    },
    update: {
      name: 'Nguyễn Văn Manager',
      passwordHash: managerPassword,
      role: 'MANAGER',
      status: 'ACTIVE',
      departmentId: department.id,
    },
    create: {
      name: 'Nguyễn Văn Manager',
      email: 'manager@lydinc.local',
      passwordHash: managerPassword,
      role: 'MANAGER',
      status: 'ACTIVE',
      departmentId: department.id,
    },
  });

  const member = await prisma.user.upsert({
    where: {
      email: 'member@lydinc.local',
    },
    update: {
      name: 'Trần Thị Member',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: department.id,
    },
    create: {
      name: 'Trần Thị Member',
      email: 'member@lydinc.local',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: department.id,
    },
  });

  return {
    admin,
    manager,
    member,
    department,
  };
}

async function seedProject({
  adminId,
  managerId,
  memberId,
  departmentId,
}: {
  adminId: string;
  managerId: string;
  memberId: string;
  departmentId: string;
}) {
  const project = await prisma.project.upsert({
    where: {
      code: 'ANGC-WEB-2026',
    },
    update: {
      name: 'Xây dựng website cuộc thi ANGC 2026',
      description:
        'Thiết kế và phát triển website cung cấp thông tin cho cuộc thi ANGC 2026.',
      status: 'ACTIVE',
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      endDate: new Date('2026-09-30T23:59:59.000Z'),
      departmentId,
      managerId,
      createdById: adminId,
    },
    create: {
      code: 'ANGC-WEB-2026',
      name: 'Xây dựng website cuộc thi ANGC 2026',
      description:
        'Thiết kế và phát triển website cung cấp thông tin cho cuộc thi ANGC 2026.',
      status: 'ACTIVE',
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      endDate: new Date('2026-09-30T23:59:59.000Z'),
      departmentId,
      managerId,
      createdById: adminId,
    },
  });

  for (const userId of [managerId, memberId]) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        userId,
      },
    });
  }

  return project;
}

async function seedTasks({
  projectId,
  managerId,
  memberId,
}: {
  projectId: string;
  managerId: string;
  memberId: string;
}) {
  const tasks = [
    {
      id: 'seed-task-homepage-design',
      title: 'Thiết kế trang giới thiệu cuộc thi',
      description:
        'Thiết kế bố cục trang chủ và khu vực giới thiệu tổng quan cuộc thi.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 40,
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      dueDate: new Date('2026-08-10T23:59:59.000Z'),
      assigneeId: memberId,
    },
    {
      id: 'seed-task-award-structure',
      title: 'Xây dựng trang cơ cấu giải thưởng',
      description:
        'Trình bày hạng mục thi, cơ cấu giải thưởng và quyền lợi thí sinh.',
      status: 'TODO',
      priority: 'MEDIUM',
      progress: 0,
      startDate: new Date('2026-08-05T00:00:00.000Z'),
      dueDate: new Date('2026-08-15T23:59:59.000Z'),
      assigneeId: memberId,
    },
    {
      id: 'seed-task-module-content',
      title: 'Viết nội dung các module thi',
      description:
        'Hoàn thiện nội dung cho ICODE, AI Tech 4 Good, ED4C và G-CLIPS.',
      status: 'REVIEW',
      priority: 'HIGH',
      progress: 90,
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      dueDate: new Date('2026-08-12T23:59:59.000Z'),
      assigneeId: managerId,
    },
    {
      id: 'seed-task-registration-form',
      title: 'Xây dựng biểu mẫu đăng ký',
      description: 'Tạo biểu mẫu đăng ký và kiểm tra dữ liệu đầu vào.',
      status: 'TODO',
      priority: 'URGENT',
      progress: 0,
      startDate: new Date('2026-08-10T00:00:00.000Z'),
      dueDate: new Date('2026-08-20T23:59:59.000Z'),
      assigneeId: memberId,
    },
    {
      id: 'seed-task-mobile-testing',
      title: 'Kiểm tra giao diện trên điện thoại',
      description:
        'Kiểm tra bố cục và khả năng sử dụng trên các kích thước màn hình.',
      status: 'TODO',
      priority: 'MEDIUM',
      progress: 0,
      startDate: new Date('2026-08-20T00:00:00.000Z'),
      dueDate: new Date('2026-08-30T23:59:59.000Z'),
      assigneeId: memberId,
    },
  ] as const;

  for (const task of tasks) {
    await prisma.task.upsert({
      where: {
        id: task.id,
      },
      update: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        startDate: task.startDate,
        dueDate: task.dueDate,
        projectId,
        assigneeId: task.assigneeId,
        createdById: managerId,
      },
      create: {
        ...task,
        projectId,
        createdById: managerId,
      },
    });
  }

  await prisma.comment.upsert({
    where: {
      id: 'seed-comment-homepage-progress',
    },
    update: {
      content:
        'Em đã hoàn thành bản bố cục đầu tiên. Nhờ anh/chị kiểm tra phần phân cấp nội dung.',
      taskId: 'seed-task-homepage-design',
      authorId: memberId,
    },
    create: {
      id: 'seed-comment-homepage-progress',
      content:
        'Em đã hoàn thành bản bố cục đầu tiên. Nhờ anh/chị kiểm tra phần phân cấp nội dung.',
      taskId: 'seed-task-homepage-design',
      authorId: memberId,
    },
  });
}

async function main() {
  console.log('Starting database seed...');

  await seedDepartments();

  const { admin, manager, member, department } = await seedUsers();

  const project = await seedProject({
    adminId: admin.id,
    managerId: manager.id,
    memberId: member.id,
    departmentId: department.id,
  });

  await seedTasks({
    projectId: project.id,
    managerId: manager.id,
    memberId: member.id,
  });

  console.log('Database seed completed.');
  console.log('');
  console.log('Local accounts:');
  console.log('Admin:   admin@lydinc.local / Admin@123');
  console.log('Manager: manager@lydinc.local / Manager@123');
  console.log('Member:  member@lydinc.local / Member@123');
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
