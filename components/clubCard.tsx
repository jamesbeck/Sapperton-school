import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import type { Club } from "@/payload-types";
import ClubSessions from "@/components/clubSessions";

export default function ClubCard({ club }: { club: Club }) {
  const image = typeof club.image === "object" ? club.image : null;
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="flex flex-col items-center gap-4 w-64 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 rounded-lg"
    >
      <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-200">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt || club.name}
            fill
            sizes="192px"
            style={{
              objectFit: "cover",
              objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 50}%`,
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <Users className="w-24 h-24" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-1">
        <h3 className="text-xl text-center">{club.name}</h3>
        <p className="text-center text-sm">{club.years}</p>
        <div className="text-sm mt-2">
          <ClubSessions sessions={club.sessions} />
        </div>
      </div>
    </Link>
  );
}
