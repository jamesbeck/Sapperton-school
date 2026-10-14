import Link from "next/link";
import ClubSessions from "./clubSessions";
import H2 from "./ui/h2";
import {
  countBlockSessions,
  formatBlockDate,
  formatClubPrice,
  getBlockState,
  type ClubBlock,
} from "@/utils/clubBlocks";

export default function ClubBlockDetails({ block }: { block: ClubBlock }) {
  const count = countBlockSessions(block);
  const state = getBlockState(block);
  const unavailable =
    state === "past" ||
    block.bookingStatus === "full" ||
    block.bookingStatus === "closed";
  const bookingLabel =
    block.bookingMethod === "parentpay"
      ? "Book via ParentPay"
      : block.bookingMethod === "external"
        ? "Book with the provider"
        : "Contact the school to book";
  return (
    <section className="rounded-xl border border-sapperton-green/20 bg-white p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <H2>{block.label}</H2>
        {state === "past" ? (
          <span className="text-sm rounded-full bg-gray-100 px-3 py-1">
            Previous block
          </span>
        ) : state === "upcoming" ? (
          <span className="text-sm rounded-full bg-gray-100 px-3 py-1">
            Upcoming block
          </span>
        ) : null}
      </div>
      <dl className="grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Dates</dt>
          <dd>
            {formatBlockDate(block.startDate)} –{" "}
            {formatBlockDate(block.endDate)}
            <br />
            {count} {count === 1 ? "session" : "sessions"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Weekly timetable</dt>
          <dd>
            <ClubSessions sessions={block.sessions} />
          </dd>
        </div>
        {block.totalPrice != null && (
          <div>
            <dt className="font-semibold">Full block price</dt>
            <dd className="text-xl">{formatClubPrice(block.totalPrice)}</dd>
            {block.showSessionPrice && count > 0 && (
              <dd className="text-sm">
                {formatClubPrice(block.totalPrice / count)} per session
              </dd>
            )}
          </div>
        )}
        {block.capacity != null && (
          <div>
            <dt className="font-semibold">Maximum places</dt>
            <dd>{block.capacity}</dd>
          </div>
        )}
        {block.externalLeader && (
          <div>
            <dt className="font-semibold">Club leader</dt>
            <dd>{block.externalLeader}</dd>
          </div>
        )}
        {block.snackProvided && (
          <div>
            <dt className="font-semibold">Snack</dt>
            <dd>A snack is provided.</dd>
          </div>
        )}
        {block.whatToBring && (
          <div className="sm:col-span-2">
            <dt className="font-semibold">What to bring</dt>
            <dd className="whitespace-pre-line">{block.whatToBring}</dd>
          </div>
        )}
        {!!block.excludedDates?.length && (
          <div className="sm:col-span-2">
            <dt className="font-semibold">No session on</dt>
            <dd>
              <ul className="list-disc pl-5">
                {block.excludedDates.map((date, index) => (
                  <li key={index}>
                    {formatBlockDate(date.date)}
                    {date.reason ? ` — ${date.reason}` : ""}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      <div className="border-t border-sapperton-green/20 pt-5 flex flex-col items-start gap-3">
        {unavailable ? (
          <p className="font-semibold">
            {state === "past"
              ? "This block has finished."
              : block.bookingStatus === "full"
                ? "This block is full."
                : "Bookings are closed."}
          </p>
        ) : (
          <>
            {block.bookingStatus === "open" && <p>Bookings are open.</p>}
            {block.bookingURL ? (
              <a
                href={block.bookingURL}
                className="inline-flex rounded-md bg-sapperton-green px-5 py-3 text-white font-semibold hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {bookingLabel}
              </a>
            ) : (
              <p className="font-semibold">{bookingLabel}</p>
            )}
          </>
        )}
        <Link
          href="/clubs#booking-information"
          className="text-sm underline underline-offset-4"
        >
          Booking policy and payment plans
        </Link>
      </div>
    </section>
  );
}
