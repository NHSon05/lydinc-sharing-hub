---

# 4. `docs/DATABASE.md`

````md
# Thiết kế cơ sở dữ liệu – LYDINC TaskHub

## 1. Công nghệ

- Database: PostgreSQL
- ORM: Prisma ORM
- Primary key: String sử dụng CUID
- Timestamp: DateTime
- Migration: Prisma Migrate

---

## 2. Danh sách model

Hệ thống gồm các model:

1. Department
2. User
3. Project
4. ProjectMember
5. Task
6. Comment
7. ActivityLog

---

## 3. Sơ đồ quan hệ

```text
Department
├── Users
└── Projects

User
├── Managed Projects
├── Created Projects
├── Project Memberships
├── Assigned Tasks
├── Created Tasks
├── Comments
└── Activity Logs

Project
├── Department
├── Manager
├── Creator
├── Members
└── Tasks

Task
├── Project
├── Assignee
├── Creator
└── Comments
```

```

```
