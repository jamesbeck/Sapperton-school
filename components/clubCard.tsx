import Image from "next/image";
import Link from "next/link";
import type { Club } from "@/payload-types";
import ClubSessions from "@/components/clubSessions";
import {
  countBlockSessions,
  formatBlockDate,
  formatClubPrice,
  getBlockState,
  getFeaturedBlock,
} from "@/utils/clubBlocks";

export default function ClubCard({ club }: { club: Club }) {
  const image = typeof club.image === "object" ? club.image : null;
  const block = getFeaturedBlock(club.blocks);
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="flex h-full flex-col gap-4 rounded-xl border border-sapperton-green/25 bg-white p-6 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className="flex items-start gap-4">
        {image?.url && (
          <Image
            src={image.url}
            alt={image.alt || club.name}
            width={64}
            height={64}
            sizes="64px"
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
            style={{
              objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 50}%`,
            }}
          />
        )}
        <div>
          <h3 className="text-xl font-semibold">{club.name}</h3>
          <p className="mt-1 text-sm">{club.years}</p>
        </div>
      </div>
      {block ? (
        <>
          <div className="text-sm">
            <ClubSessions sessions={block.sessions} />
          </div>
          <div className="text-sm">
            <p className="font-semibold">{block.label}</p>
            <p>
              {formatBlockDate(block.startDate)} –{" "}
              {formatBlockDate(block.endDate)}
            </p>
            <p>
              {countBlockSessions(block)} sessions
              {getBlockState(block) === "past" ? " · Previous block" : ""}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-sapperton-green/20 pt-4">
            {block.totalPrice != null && (
              <span className="font-semibold">
                {formatClubPrice(block.totalPrice)} for the block
              </span>
            )}
            <span className="text-sm underline underline-offset-4">
              View details
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm">Term details will be confirmed soon.</p>
      )}
    </Link>
  );
}
