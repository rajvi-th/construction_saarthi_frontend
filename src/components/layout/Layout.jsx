/**
 * Layout Component
 * Main layout wrapper with background color for all pages
 */

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {children}
    </div>
  );
}

