import { getPayload, Payload } from "payload";
import configPromise from "@payload-config";

const globalForPayload = global as unknown as {
  payload: Payload;
};

const payload =
  globalForPayload.payload || (await getPayload({ config: configPromise }));

if (process.env.NODE_ENV !== "production") globalForPayload.payload = payload;

export default payload;
