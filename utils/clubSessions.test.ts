import assert from "node:assert/strict";
import { test } from "node:test";
import {
  validateClubSessions,
  sortClubSessions,
  formatClubSession,
  formatClubTime,
} from "./clubSessions";

const session = { day: "monday", startTime: "15:15", endTime: "16:15" };

test("supports multiple sessions and existing clubs without a schedule", () => {
  assert.equal(validateClubSessions(undefined), true);
  assert.equal(validateClubSessions([]), true);
  assert.equal(
    validateClubSessions([session, { ...session, day: "thursday" }]),
    true,
  );
  assert.equal(
    validateClubSessions([
      session,
      { ...session, startTime: "17:00", endTime: "18:00" },
    ]),
    true,
  );
});

test("rejects invalid and incomplete schedules, duplicates and overnight ranges", () => {
  for (const invalid of [
    { ...session, day: "not-a-day" },
    { ...session, startTime: "24:00" },
    { ...session, endTime: "16:60" },
    { ...session, startTime: "3:15 pm" },
    { ...session, endTime: "" },
    { ...session, endTime: "15:15" },
    { ...session, startTime: "23:00", endTime: "01:00" },
    null,
  ])
    assert.equal(typeof validateClubSessions([invalid]), "string");
  assert.equal(typeof validateClubSessions([session, session]), "string");
});

test("sorts by weekday then start time without changing the stored array", () => {
  const sessions = [
    { ...session, day: "sunday" },
    { ...session, startTime: "17:00", endTime: "18:00" },
    session,
  ];
  assert.deepEqual(sortClubSessions(sessions), [
    session,
    sessions[1],
    sessions[0],
  ]);
  assert.equal(sessions[0].day, "sunday");
});

test("formats local school times without timezone or daylight-saving conversion", () => {
  assert.equal(formatClubSession(session), "Monday, 3:15 pm–4:15 pm");
  assert.equal(formatClubTime("00:00"), "12:00 am");
  assert.equal(formatClubTime("12:00"), "12:00 pm");
  assert.equal(formatClubTime("09:05"), "9:05 am");
});
