import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getTask } from '@/modules/tasks/task.service';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import { TaskPriorityBadge } from '@/components/tasks/task-priority-badge';

type PageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function TaskDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { taskId } = await params;

  let task = null;

  try {
    task = await getTask({
      actor: session.user,
      id: taskId,
    });
  } catch (err: unknown) {
    console.error('Error loading task detail:', err);
    notFound();
  }

  if (!task) {
    notFound();
  }

  const formatDate = (dateInput: string | Date | null): string => {
    if (!dateInput) return '-';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button & header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="font-mono text-sm text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-lg">
              {task.project.code}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {task.title}
            </h1>
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Result */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Description */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md space-y-3 text-left">
            <h3 className="text-sm font-bold text-white">Mô tả công việc</h3>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {task.description || (
                <span className="text-zinc-500 italic">Chưa có mô tả chi tiết cho nhiệm vụ này.</span>
              )}
            </p>
          </div>

          {/* Card: Result */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md space-y-3 text-left">
            <h3 className="text-sm font-bold text-white">Báo cáo kết quả / Kết quả thực hiện</h3>
            {task.result ? (
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                {task.result}
              </p>
            ) : (
              <p className="text-xs text-zinc-500 italic">Chưa có báo cáo kết quả thực hiện.</p>
            )}
          </div>
        </div>

        {/* Right Column: Metadata details */}
        <div className="space-y-6 text-left">
          {/* Card: metadata info */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Thông tin chung</h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Dự án liên kết</span>
                <span className="font-semibold text-zinc-100">{task.project.name}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Người thực hiện</span>
                <span className="font-semibold text-zinc-100">{task.assignee?.name || 'Chưa phân công'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Người tạo nhiệm vụ</span>
                <span className="font-semibold text-zinc-100">{task.createdBy?.name || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Ngày bắt đầu</span>
                <span className="font-mono text-zinc-200">{formatDate(task.startDate)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Hạn hoàn thành</span>
                <span className={task.isOverdue ? 'font-bold text-rose-400' : 'font-mono text-zinc-200'}>
                  {formatDate(task.dueDate)}
                  {task.isOverdue && ' (Quá hạn)'}
                </span>
              </div>

              {task.completedAt && (
                <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                  <span className="text-zinc-400 font-medium">Ngày hoàn thành</span>
                  <span className="font-mono text-emerald-400">{formatDate(task.completedAt)}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Ngày tạo</span>
                <span className="font-mono text-zinc-200">{formatDate(task.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-400 font-medium">Cập nhật gần nhất</span>
                <span className="font-mono text-zinc-200">{formatDate(task.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Card: progress */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Tiến trình thực hiện</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Mức độ hoàn thành</span>
                <span className="font-mono font-bold text-zinc-200">{task.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
