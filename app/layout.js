import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'NETSCALE – ISP Management SaaS',
  description: 'ISP Management SaaS',
  icons: { icon: '/appicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans bg-background text-foreground" suppressHydrationWarning>
        <TooltipProvider>
          {children}
          <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
        </TooltipProvider>
      </body>
    </html>
  );
}
