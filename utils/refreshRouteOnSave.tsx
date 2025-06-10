"use client";
import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation.js";
import React from "react";
import useProtocolDomainAndPort from "./useProtocolDomainAndPort";

export const RefreshRouteOnSave: React.FC = () => {
  const router = useRouter();
  const serverURL = useProtocolDomainAndPort();

  return (
    <>
      {serverURL && (
        <PayloadLivePreview
          refresh={() => router.refresh()}
          serverURL={serverURL}
        />
      )}
    </>
  );
};
