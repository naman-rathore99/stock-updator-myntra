import './globals.css';
export const metadata = { title: 'Stockroom | Inventory Manager', description: 'Simple inventory and stock updates.' };
export const viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">{children}</body>
    </html>
  );
}
