export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto py-16 md:py-24 w-full px-8 md:px-16">
      {children}
    </div>
  );
}
