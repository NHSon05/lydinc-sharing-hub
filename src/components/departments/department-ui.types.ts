export type DepartmentItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    users: number;
    projects: number;
  };
  counts?: {
    users: number;
    projects: number;
  };
};

export type PaginationInfo = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
