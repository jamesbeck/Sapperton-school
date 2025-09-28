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
          <div className="relative w-48 h-48 rounded-full overflow-hidden">
            {!!image?.url && (
              <Image
                src={image?.url || ""}
                alt={schoolClass.name || ""}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: `${image?.focalX}% ${image?.focalY}%`,
                }}
              />
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xl text-center ">{schoolClass.name}</div>
            <div className="text-center text-sm">Years {schoolClass.years}</div>
          </div>
        </div>
      </HoverScale>
    </Link>
  );
}
