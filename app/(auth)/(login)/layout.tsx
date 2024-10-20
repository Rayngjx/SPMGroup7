import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default async function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen items-center justify-center">
      {children}
      <ToastContainer />
    </main>
  );
}
