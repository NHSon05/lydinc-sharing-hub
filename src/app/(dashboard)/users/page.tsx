import { redirect } from 'next/navigation';

export default async function UsersRedirectPage() {
  redirect('/admin/users');
}

