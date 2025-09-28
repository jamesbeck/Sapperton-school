import { bodoniModa } from "../../fonts";

export default function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className={`w-full text-center text-5xl font-birthstone ${bodoniModa.className}`}
    >
      {children}
    </h2>
  );
}
