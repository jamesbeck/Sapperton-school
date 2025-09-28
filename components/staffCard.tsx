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
          <div className="relative w-48 h-48 rounded-full overflow-hidden">
            {!!image?.url && (
              <Image
                src={image?.url || ""}
                alt={staff.name || ""}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: `${image?.focalX}% ${image?.focalY}%`,
                }}
              />
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
