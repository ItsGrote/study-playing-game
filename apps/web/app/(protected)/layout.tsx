export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</div>;
}
