import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export default async function DepartmentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Authorize: Only active ADMIN users
  if (session.user.role !== 'ADMIN' || session.user.status !== 'ACTIVE') {
    redirect('/dashboard');
  }

  const departments = await db.department.findMany({
    include: {
      _count: {
        select: { users: true, projects: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý phòng ban</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Thiết lập phòng ban và thống kê nhân sự, dự án. (Quyền Admin)
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/10 transition-colors cursor-pointer">
          + Tạo phòng ban mới
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length > 0 ? (
          departments.map((department) => (
            <div
              key={department.id}
              className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700/50 transition-all duration-300 shadow-xl group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {department.name}
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>

                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {department.description || 'Chưa có mô tả chi tiết cho phòng ban này.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/60 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-850/60">
                  <p className="text-lg font-extrabold text-purple-400">{department._count.users}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold mt-0.5">Nhân sự</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-850/60">
                  <p className="text-lg font-extrabold text-blue-400">{department._count.projects}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold mt-0.5">Dự án</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-sm text-zinc-500">Chưa có phòng ban nào được tạo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
