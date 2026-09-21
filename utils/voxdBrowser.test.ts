import assert from "node:assert/strict";
import test from "node:test";
import {
  isConversationTimedOut,
  type VoxdConversation,
} from "./voxdBrowser";

const NOW = Date.parse("2026-09-21T12:00:00.000Z");

test("treats the server timeout flag as authoritative", () => {
  const conversation: VoxdConversation = {
    id: "timed-out",
    sessionTimedOut: true,
    sessionExpiresAt: "2026-09-22T12:00:00.000Z",
  };

  assert.equal(isConversationTimedOut(conversation, NOW), true);
});

test("treats an elapsed session expiry as timed out", () => {
  const conversation: VoxdConversation = {
    id: "elapsed",
    sessionTimedOut: false,
    sessionExpiresAt: "2026-09-21T11:59:59.999Z",
  };

  assert.equal(isConversationTimedOut(conversation, NOW), true);
});

test("allows active and not-yet-started sessions to resume", () => {
  assert.equal(
    isConversationTimedOut(
      {
        id: "active",
        sessionTimedOut: false,
        sessionExpiresAt: "2026-09-21T12:00:00.001Z",
      },
      NOW,
    ),
    false,
  );
  assert.equal(
    isConversationTimedOut(
      {
        id: "empty",
        lastClientMessageAt: null,
        sessionExpiresAt: null,
        sessionTimedOut: false,
      },
      NOW,
    ),
    false,
  );
});
