"use client";
import Container from "./container";
import { AnimateIn } from "@/utils/animateIn";

export default function VideoSection() {
  return (
    <Container colour="green">
      <AnimateIn>
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src="https://player.vimeo.com/video/1009946220?badge=0&autopause=0&autoplay=1&muted=1&loop=1&controls=0&background=1"
              className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
              style={{ border: "none" }}
              allow="autoplay; fullscreen; picture-in-picture"
              title="Sapperton School Video"
            />
          </div>
        </div>
      </AnimateIn>
    </Container>
  );
}
