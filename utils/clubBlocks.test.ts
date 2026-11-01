import test from "node:test";
import assert from "node:assert/strict";
import {
  countBlockSessions,
  getClubState,
  isActiveClub,
  getFeaturedBlock,
  getBlockState,
  validateClubBlocks,
  validateBookingURL,
  type ClubBlock,
} from "./clubBlocks";
const base: ClubBlock = {
  label: "Autumn 2026",
  startDate: "2026-09-11T00:00:00.000Z",
  endDate: "2026-10-23T00:00:00.000Z",
  sessions: [{ day: "friday", startTime: "15:25", endTime: "16:30" }],
  excludedDates: [{ date: "2026-10-02T00:00:00.000Z", reason: "INSET day" }],
  bookingMethod: "parentpay",
  totalPrice: 24,
};
test("inclusive block counts exclude INSET dates and include multiple weekly sessions", () => {
  assert.equal(countBlockSessions(base), 6);
  assert.equal(countBlockSessions({ ...base, excludedDates: [] }), 7);
  assert.equal(
    countBlockSessions({
      ...base,
      sessions: [
        ...base.sessions!,
        { day: "monday", startTime: "15:25", endTime: "16:30" },
      ],
    }),
    12,
  );
});
test("rejects invalid block dates, exclusions, schedules and unsafe booking links", () => {
  assert.equal(validateClubBlocks([base]), true);
  for (const block of [
    { ...base, endDate: "2026-09-01" },
    { ...base, startDate: "2026-02-30" },
    { ...base, excludedDates: [{ date: "2026-11-02" }] },
    {
      ...base,
      excludedDates: [...base.excludedDates!, ...base.excludedDates!],
    },
    { ...base, sessions: [] },
    { ...base, bookingMethod: "external" },
  ])
    assert.notEqual(validateClubBlocks([block]), true);
  assert.notEqual(validateBookingURL("javascript:alert(1)"), true);
  assert.equal(
    validateBookingURL("https://bookwhen.com/rafflesforestschool"),
    true,
  );
});
test("featured block favours current, then upcoming, then latest past block in London time", () => {
  const future = {
    ...base,
    label: "Spring",
    startDate: "2027-01-01",
    endDate: "2027-02-01",
  };
  assert.equal(
    getFeaturedBlock([future, base], new Date("2026-10-14T12:00:00Z"))?.label,
    "Autumn 2026",
  );
  assert.equal(
    getFeaturedBlock([future, base], new Date("2026-10-24T12:00:00Z"))?.label,
    "Spring",
  );
  assert.equal(getBlockState(base, new Date("2026-10-23T23:30:00Z")), "past");
  assert.equal(
    getFeaturedBlock([future, base], new Date("2028-01-01"))?.label,
    "Spring",
  );
});

test("club lifecycle follows dated blocks, including returning clubs and missing schedules", () => {
  const now = new Date("2026-10-14T12:00:00Z");
  const past = { ...base, startDate: "2026-01-01", endDate: "2026-02-01" };
  const future = { ...base, startDate: "2027-01-01", endDate: "2027-02-01" };
  assert.equal(getClubState(undefined, now), "unclassified");
  assert.equal(getClubState([], now), "unclassified");
  assert.equal(getClubState([past], now), "past");
  assert.equal(getClubState([past, future], now), "upcoming");
  assert.equal(getClubState([future, past, base], now), "current");
  assert.equal(isActiveClub({ blocks: [past] }, now), false);
  assert.equal(isActiveClub({}, now), false);
  assert.equal(isActiveClub({ blocks: [future] }, now), true);
  assert.equal(isActiveClub({ blocks: [{ ...base, bookingStatus: "full" }] }, now), true);
  assert.equal(isActiveClub({ blocks: [{ ...base, bookingStatus: "closed" }] }, now), true);
});

test("club dates include the final day and change at London midnight", () => {
  assert.equal(getClubState([base], new Date("2026-09-10T23:00:00Z")), "current");
  assert.equal(getClubState([base], new Date("2026-10-23T22:59:59Z")), "current");
  assert.equal(getClubState([base], new Date("2026-10-23T23:00:00Z")), "past");
});
