export type VoxdExecutionMode = "test" | "live";

type RuntimeEnvironment = {
  nodeEnv?: string;
  vercelEnv?: string;
};

export function getVoxdExecutionMode({
  nodeEnv = process.env.NODE_ENV,
  vercelEnv = process.env.VERCEL_ENV,
}: RuntimeEnvironment = {}): VoxdExecutionMode {
  if (vercelEnv) {
    return vercelEnv === "production" ? "live" : "test";
  }

  return nodeEnv === "production" ? "live" : "test";
}

export function getVoxdResumeCookieName(mode: VoxdExecutionMode) {
  return `sapperton_voxd_resume_${mode}`;
}
