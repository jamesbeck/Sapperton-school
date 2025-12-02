import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function Breadcrumbs({
  crumbs,
}: {
  crumbs: { label?: string | null; url?: string | null }[];
}) {
  return (
    <div className="bg-sapperton-green text-white text-sm">
      <div className="max-w-7xl mx-auto py-4 w-full px-8 md:px-16 ">
        <div className="flex space-x-2">
          <Link href="/" className=" text-white hover:underline">
            Home
          </Link>
          {crumbs.map((crumb, i) => (
            <div key={i} className="flex space-x-2">
              <ChevronRightIcon className="w-4 h-4 relative top-[2px]" />
              {crumb.url ? (
                <Link href={crumb.url} className=" text-white hover:underline">
                  {crumb.label || "Unknown"}
                </Link>
              ) : (
                <span className="text-white/80">
                  {crumb.label || "Unknown"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
