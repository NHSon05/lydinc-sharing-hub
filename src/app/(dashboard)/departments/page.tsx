import { redirect } from 'next/navigation';

export default async function DepartmentsRedirectPage() {
  redirect('/admin/departments');
}

