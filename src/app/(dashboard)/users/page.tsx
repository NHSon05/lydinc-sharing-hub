import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Authorize: Only active ADMIN users
  if (session.user.role !== 'ADMIN' || session.user.status !== 'ACTIVE') {
    redirect('/dashboard');
  }

  const users = await db.user.findMany({
    include: {
      department: true,
    },
    orderBy: { name: 'asc' },
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'MANAGER':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'LOCKED':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý thành viên</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Quản lý tài khoản, vai trò, phòng ban và trạng thái tài khoản. (Quyền Admin)
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/10 transition-colors cursor-pointer">
          + Thêm tài khoản mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/10">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email..."
          className="flex-1 px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm focus:outline-none focus:border-purple-500 text-zinc-100"
        />
        <select className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm text-zinc-400 focus:outline-none focus:border-purple-500">
          <option value="">Tất cả vai trò</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="MEMBER">Member</option>
        </select>
        <select className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-850 text-sm text-zinc-400 focus:outline-none focus:border-purple-500">
          <option value="">Trạng thái</option>
          <option value="ACTIVE">Active</option>
          <option value="LOCKED">Locked</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Users Table List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase bg-zinc-900/40">
                <th className="py-4 px-6">Thành viên</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phòng ban</th>
                <th className="py-4 px-6">Vai trò</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {users.length > 0 ? (
                users.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-zinc-100">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 font-mono text-xs">{item.email}</td>
                    <td className="py-4 px-6 text-zinc-300">{item.department.name}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeClass(item.role)}`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="px-3 py-1 rounded-lg border border-zinc-850 hover:bg-zinc-900 text-xs font-medium text-zinc-300 transition-colors cursor-pointer mr-2">
                        Sửa
                      </button>
                      <button className="px-3 py-1 rounded-lg bg-zinc-950 hover:bg-rose-950/30 hover:border-rose-500/20 hover:text-rose-400 border border-zinc-850 text-xs font-medium text-zinc-500 transition-colors cursor-pointer">
                        Khóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Chưa có tài khoản nào được đăng ký.
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
