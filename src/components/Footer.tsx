export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex items-center justify-center py-10 border-t border-surface-border mt-8 text-gray-500 px-6 lg:px-40">
      <div className="text-xs">
        © {currentYear} Travelogue Portfolio. All rights reserved.
      </div>
    </footer>
  );
}
