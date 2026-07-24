import { redirect } from 'next/navigation';
import Link from 'next/link';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  // Fetch KPI stats from database
  const [
    activeProjectsCount,
    totalTasksCount,
    reviewTasksCount,
    overdueTasksCount,
    upcomingTasks,
    recentProjects,
  ] = await Promise.all([
    db.project.count({ where: { status: 'ACTIVE' } }),
    db.task.count(),
    db.task.count({ where: { status: 'REVIEW' } }),
    db.task.count({
      where: {
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        dueDate: { lt: new Date() },
      },
    }),
    db.task.findMany({
      where: {
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: {
        project: true,
        assignee: true,
      },
    }),
    db.project.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        manager: true,
        _count: {
          select: { tasks: true, members: true },
        },
      },
    }),
  ]);

  const kpis = [
    {
      title: 'Dự án đang chạy',
      value: activeProjectsCount,
      icon: (
        <svg
          className="w-6 h-6 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
          />
        </svg>
      ),
      bg: 'bg-purple-500/5 border-purple-500/10',
    },
    {
      title: 'Tổng số nhiệm vụ',
      value: totalTasksCount,
      icon: (
        <svg
          className="w-6 h-6 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bg: 'bg-blue-500/5 border-blue-500/10',
    },
    {
      title: 'Đang chờ duyệt',
      value: reviewTasksCount,
      icon: (
        <svg
          className="w-6 h-6 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bg: 'bg-amber-500/5 border-amber-500/10',
    },
    {
      title: 'Nhiệm vụ quá hạn',
      value: overdueTasksCount,
      icon: (
        <svg
          className="w-6 h-6 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      bg: 'bg-rose-500/5 border-rose-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner section */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-75 h-75 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Chào mừng trở lại, {user.name}!
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl">
            Hệ thống LYDINC TaskHub giúp bạn kiểm soát dự án và công việc một
            cách trực quan, tối ưu hóa quy trình cộng tác nội bộ.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border backdrop-blur-md flex items-center justify-between transition-all hover:scale-[1.01] ${kpi.bg}`}
          >
            <div className="space-y-1">
              <p className="text-xs text-zinc-400 font-medium">{kpi.title}</p>
              <p className="text-3xl font-extrabold text-white">{kpi.value}</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Recent Projects + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Dự án mới cập nhật
            </h3>
            <Link
              href="/projects"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 hover:bg-zinc-900/30 hover:border-zinc-700/50 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-zinc-500">
                      {project.code}
                    </p>
                    <p className="text-sm font-semibold text-zinc-200">
                      {project.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-500">
                      {project._count.members} thành viên
                    </span>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-zinc-800 border-zinc-700 text-zinc-400 uppercase">
                      {project.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-6">
                Chưa có dự án nào được tạo.
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Nhiệm vụ sắp đến hạn
            </h3>
            <Link
              href="/tasks"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 hover:bg-zinc-900/30 hover:border-zinc-700/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-200">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{task.project.name}</span>
                      <span>•</span>
                      <span>Giao cho: {task.assignee.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs text-zinc-400 font-medium">
                      Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase ${
                        task.priority === 'URGENT'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          : task.priority === 'HIGH'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-6">
                Không có nhiệm vụ sắp đến hạn.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
