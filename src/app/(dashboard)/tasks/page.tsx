import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export default async function TasksPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const tasks = await db.task.findMany({
    include: {
      project: true,
      assignee: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'REVIEW':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'TODO':
        return 'bg-zinc-850 border-zinc-750 text-zinc-400';
      default:
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'HIGH':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'MEDIUM':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý nhiệm vụ</h1>
          <p className="text-xs text-zinc-400 mt-1">Danh sách và trạng thái các nhiệm vụ trong dự án.</p>
        </div>
        {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/10 transition-colors cursor-pointer">
            + Tạo nhiệm vụ mới
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/10">
        <input
          type="text"
          placeholder="Tìm kiếm nhiệm vụ..."
          className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm focus:outline-none focus:border-purple-500 text-zinc-100"
        />
        <select className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm text-zinc-400 focus:outline-none focus:border-purple-500">
          <option value="">Trạng thái</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm text-zinc-400 focus:outline-none focus:border-purple-500">
          <option value="">Độ ưu tiên</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <select className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm text-zinc-400 focus:outline-none focus:border-purple-500">
          <option value="">Thời hạn</option>
          <option value="overdue">Đã quá hạn</option>
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
        </select>
      </div>

      {/* Tasks Table List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase bg-zinc-900/40">
                <th className="py-4 px-6">Nhiệm vụ</th>
                <th className="py-4 px-6">Dự án</th>
                <th className="py-4 px-6">Người phụ trách</th>
                <th className="py-4 px-6">Độ ưu tiên</th>
                <th className="py-4 px-6">Tiến độ</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6">Thời hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-zinc-100">{task.title}</td>
                    <td className="py-4 px-6 text-zinc-400">{task.project.name}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-400">
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-zinc-200">{task.assignee.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 w-28">
                        <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-zinc-400">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">
                      {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Chưa có nhiệm vụ nào được tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
