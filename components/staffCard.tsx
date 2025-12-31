"use client";
import { HoverScale } from "@/utils/hoverScale";
import Image from "next/image";
import { Staff, Media } from "@/payload-types";
import Link from "next/link";

export default function StaffCard({ staff }: { staff: Staff }) {
  const image = staff.image as Media;

  return (
    <Link href={`/our-school/staff/${staff.slug}`}>
      <HoverScale>
        <div
          key={staff.id}
          className="flex flex-col items-center space-y-4 w-56"
        >
          <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-200">
            {image?.url ? (
              <Image
                src={image?.url || ""}
                alt={staff.name || ""}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: `${image?.focalX}% ${image?.focalY}%`,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
                <svg
                  className="w-24 h-24 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xl text-center ">{staff.name}</div>
            <div className="text-center text-sm">{staff.position}</div>
          </div>
        </div>
      </HoverScale>
    </Link>
  );
}
