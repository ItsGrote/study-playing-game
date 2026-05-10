export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex min-h-0 flex-col bg-[#151722]">{children}</div>;
}
