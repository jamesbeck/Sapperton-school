import { useEffect, useState } from "react";

export default function useProtocolDomainAndPort() {
  const [protocolDomainAndPort, setProtocolDomainAndPort] =
    useState<string>("");

  useEffect(() => {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const port = window.location.port;
    setProtocolDomainAndPort(`${protocol}//${domain}${port ? ":" + port : ""}`);
  }, []);

  return protocolDomainAndPort;
}
