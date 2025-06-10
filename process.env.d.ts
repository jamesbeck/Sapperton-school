declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      DATABASE_URI: string;
      PAYLOAD_SECRET: string;
      S3_ACCESS_KEY_ID: string;
      S3_SECRET_ACCESS_KEY: string;
      S3_BUCKET: string;
      S3_REGION: string;
      S3_ENDPOINT: string;
      // add more environment variables and their types here
    }
  }
}
