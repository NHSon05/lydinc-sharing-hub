import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const projects = await db.project.findMany({
    include: {
      manager: true,
      department: true,
      _count: {
        select: { tasks: true, members: true },
      },
    },
    orderBy: { code: 'asc' },
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'PLANNING':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'ON_HOLD':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'COMPLETED':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý dự án</h1>
          <p className="text-xs text-zinc-400 mt-1">Danh sách tất cả dự án trong hệ thống.</p>
        </div>
        {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/10 transition-colors cursor-pointer">
            + Tạo dự án mới
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/10">
        <input
          type="text"
          placeholder="Tìm kiếm dự án (mã, tên)..."
          className="flex-1 px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm focus:outline-none focus:border-purple-500 text-zinc-100"
        />
        <select className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm text-zinc-400 focus:outline-none focus:border-purple-500">
          <option value="">Tất cả trạng thái</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700/50 transition-all duration-300 shadow-xl group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-purple-400 font-semibold">{project.code}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {project.description || 'Chưa có mô tả dự án.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/60 space-y-3.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1" />
                    </svg>
                    {project.department.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {project.manager.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                  <span>
                    Hạn: {new Date(project.startDate).toLocaleDateString('vi-VN')} - {new Date(project.endDate).toLocaleDateString('vi-VN')}
                  </span>
                  <span>
                    {project._count.tasks} Nhiệm vụ
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-sm text-zinc-500">Chưa có dự án nào trong hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}
