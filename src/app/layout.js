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
        {/* Floating decorative bubbles */}
        <div className="bubbles" aria-hidden="true">
          <div className="bubble bubble-1" />
          <div className="bubble bubble-2" />
          <div className="bubble bubble-3" />
          <div className="bubble bubble-4" />
          <div className="bubble bubble-5" />
          <div className="bubble bubble-6" />
        </div>
        {children}
      </body>
    </html>
  );
}
