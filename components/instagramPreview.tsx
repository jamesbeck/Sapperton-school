"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Instagram, ExternalLink } from "lucide-react";
import Container from "./container";
import H2 from "./ui/h2";
import { AnimateIn } from "@/utils/animateIn";

const INSTAGRAM_URL = "https://www.instagram.com/sappertonprimary/";
const INSTAGRAM_HANDLE = "sappertonprimary";

export default function InstagramPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the Instagram embed script
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    // Process embeds when script loads
    const processEmbeds = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };

    script.onload = processEmbeds;

    // Also try processing after a delay in case script was already loaded
    const timer = setTimeout(processEmbeds, 1000);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <Container colour="white">
      <div className="flex flex-col gap-12">
        <AnimateIn>
          <div className="text-center flex flex-col items-center gap-4">
            <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-3 rounded-full">
              <Instagram className="w-7 h-7" />
              <span className="font-bold text-xl">Follow Our Journey</span>
            </div>
            <div className="mt-2">
              <H2>Life at Sapperton School</H2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl">
              See what&apos;s happening at Sapperton School! Follow us on
              Instagram for daily glimpses into school life, special events, and
              student achievements.
            </p>
          </div>
        </AnimateIn>

        <AnimateIn>
          <div
            ref={containerRef}
            className="w-full max-w-5xl mx-auto"
            style={{ minHeight: "400px" }}
          >
            <iframe
              src={`https://www.instagram.com/${INSTAGRAM_HANDLE}/embed`}
              className="w-full rounded-xl shadow-md"
              style={{
                border: "none",
                overflow: "hidden",
                minHeight: "600px",
              }}
              scrolling="no"
              allow="encrypted-media"
            />
          </div>
        </AnimateIn>

        <AnimateIn>
          <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-3xl">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  Daily Updates
                </p>
                <p className="text-xs text-gray-500">
                  See what we&apos;re up to
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-pink-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  Special Events
                </p>
                <p className="text-xs text-gray-500">
                  Celebrations & milestones
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  Student Work
                </p>
                <p className="text-xs text-gray-500">Amazing achievements</p>
              </div>
            </div>

            <Link
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold px-10 py-5 rounded-full hover:shadow-2xl transition-all hover:scale-105 text-lg"
            >
              <Instagram className="w-7 h-7" />
              Follow @{INSTAGRAM_HANDLE}
              <ExternalLink className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </AnimateIn>
      </div>
    </Container>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}
