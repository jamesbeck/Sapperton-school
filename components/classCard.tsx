"use client";
import { HoverScale } from "@/utils/hoverScale";
import Image from "next/image";
import { Class, Media } from "@/payload-types";
import Link from "next/link";

export default function ClassCard({ schoolClass }: { schoolClass: Class }) {
  const image = schoolClass.image as Media;

  return (
    <Link href={`/classes/${schoolClass.slug}`}>
      <HoverScale>
        <div
          key={schoolClass.id}
          className="flex flex-col items-center space-y-4 w-56"
        >
          <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-200">
            {image?.url ? (
              <Image
                src={image?.url || ""}
                alt={schoolClass.name || ""}
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xl text-center ">{schoolClass.name}</div>
            <div className="text-center text-sm">{schoolClass.years}</div>
          </div>
        </div>
      </HoverScale>
    </Link>
  );
}
