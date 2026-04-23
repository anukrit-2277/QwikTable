import './globals.css';

export const metadata = {
  title: 'QwikTable — Smart Restaurant Queue Management',
  description: 'Skip the wait. Join restaurant queues remotely, pre-order your meal, and get smart alerts when your table is ready.',
  keywords: 'restaurant, queue, waitlist, pre-order, smart dining',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
