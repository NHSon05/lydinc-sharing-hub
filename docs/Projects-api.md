Endpoint cần có

GET /api/projects
POST /api/projects
GET /api/projects/:projectId
PATCH /api/projects/:projectId
PATCH /api/projects/:projectId/status
DELETE /api/projects/:projectId

Trong MVP:

DELETE chỉ dành cho ADMIN.
Khuyến khích chuyển trạng thái CANCELLED thay vì xóa vật lý.

Cấu trúc module
`src/modules/projects/
├── project.types.ts
├── project.schema.ts
├── project.policy.ts
├── project.repository.ts
├── project.service.ts
├── project.mapper.ts
├── project.errors.ts
└── project.test.ts`
Route:
`src/app/api/projects/
├── route.ts
└── [projectId]/
    ├── route.ts
    └── status/
        └── route.ts`

# Validation

## Get List

`
Query:
page
pageSize
search
status
departmentId
managerId
startFrom
startTo
endFrom
endTo
sortBy
sortOrder`

sortBy chỉ được:
`
name
code
status
startDate
endDate
createdAt`

## POST

```json
{
  "code": "ANGC-2026",
  "name": "Website ANGC",
  "description": "...",
  "departmentId": "...",
  "managerId": "...",
  "startDate": "...",
  "endDate": "...",
  "status": "PLANNING"
}
```

Không nhận:

```md
createdById
actorId
taskCount
memberCount
progress
```

## Business Rules

### Code

Unique
Trim
Uppercase nếu convention yêu cầu

### Department

Phải tồn tại.

### Manager

Phải tồn tại
Role: ADMIN
MANAGER

### Date

startDate <= endDate

### Permission

GET list

```
ADMIN
→ tất cả

MANAGER
→ dự án quản lý hoặc tham gia

MEMBER
→ dự án tham gia
```

POST
`
ADMIN
MANAGER`
PATCH
ADMIN

Project Manager
STATUS
`
ADMIN

Project Manager
`DELETE`
ADMIN`

### Repository

Các hàm:
`
findProjects()

countProjects()

findProjectById()

findProjectByCode()

createProject()

updateProject()

updateProjectStatus()

deleteProject()

countProjectMembers()

countProjectTasks()
`

Service
Use cases
`
listProjects()

getProject()

createProject()

updateProject()

changeProjectStatus()

deleteProject()
`createProject()`
Validate

↓

Permission

↓

Department tồn tại

↓

Manager tồn tại

↓

Manager role hợp lệ

↓

Project code unique

↓

Transaction

Create Project

↓

Activity Log

↓

Return DTO
`

updateProject()
Kiểm tra

Code trùng
Department
Manager
Permission

LOG:
`PROJECT_UPDATED`
changeStatus():
`
PLANNING

ACTIVE

ON_HOLD

COMPLETED

CANCELLED
`
Không cho transition bất hợp lý.

Mapper
Không trả:
`
internal id

foreign key thừa

deleted flag

Prisma relation thô
`

DTO:

```json
{
  "id": "...",
  "code": "...",
  "name": "...",
  "status": "...",
  "department": {
    "id": "...",
    "name": "..."
  },
  "manager": {
    "id": "...",
    "name": "..."
  },
  "taskSummary": {
    "total": 10,
    "completed": 4
  }
}
```

Testing
Tối thiểu

```
ADMIN list

MANAGER list

MEMBER list

Permission

Department not found

Manager not found

Manager role invalid

Duplicate code

Date invalid

Status transition

Activity Log

Transaction rollback

DELETE permission
```

Definition of Done

```
✓ CRUD

✓ Validation

✓ Policy

✓ Repository

✓ Service

✓ Mapper

✓ Tests

✓ Activity Log

✓ Transaction

✓ API.md updated

✓ lint

✓ typecheck

✓ build
```
