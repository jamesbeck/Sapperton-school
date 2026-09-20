import assert from "node:assert/strict";
import test from "node:test";
import {
  getVoxdExecutionMode,
  getVoxdResumeCookieName,
} from "./voxdMode";

test("uses live mode only for Vercel production", () => {
  assert.equal(
    getVoxdExecutionMode({ nodeEnv: "production", vercelEnv: "production" }),
    "live",
  );
  assert.equal(
    getVoxdExecutionMode({ nodeEnv: "production", vercelEnv: "preview" }),
    "test",
  );
  assert.equal(
    getVoxdExecutionMode({ nodeEnv: "development", vercelEnv: "development" }),
    "test",
  );
});

test("uses NODE_ENV outside Vercel", () => {
  assert.equal(getVoxdExecutionMode({ nodeEnv: "production" }), "live");
  assert.equal(getVoxdExecutionMode({ nodeEnv: "development" }), "test");
  assert.equal(getVoxdExecutionMode({ nodeEnv: "test" }), "test");
});

test("keeps live and test resume credentials separate", () => {
  assert.equal(getVoxdResumeCookieName("live"), "sapperton_voxd_resume_live");
  assert.equal(getVoxdResumeCookieName("test"), "sapperton_voxd_resume_test");
});
