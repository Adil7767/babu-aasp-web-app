import { redirect } from 'next/navigation';

/** Middleware handles auth and role-based redirects for /. This is a fallback if / is hit with valid session. */
export default function Home() {
  redirect('/dashboard');
}
