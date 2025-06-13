"use client";
import { shuffleArray } from "@/utils/shuffleArray";
import Container from "@/components/container";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { bodoniModa } from "@/fonts";
import { ChevronDown } from "lucide-react";
import { AnimateIn } from "@/utils/animateIn";
import { HoverScale } from "@/utils/hoverScale";

export default function Hero() {
  return (
    <div>
      <div className="w-full h-screen relative">
        <Image
          src="/hero/2.png"
          alt="Hero"
          width={1000}
          height={600}
          className="absolute w-full h-full object-cover object-center -z-10"
        />
        <div className="px-8 md:px-16 h-full">
          <div className="h-full flex items-center">
            <Container>
              <div
                className={`text-3xl md:text-7xl text-white font-extralight tracking-tighter ${bodoniModa.className}`}
              >
                Inspiring young minds <br /> to become
                <TypeAnimation
                  sequence={shuffleArray([
                    "Achievers",
                    "Role Models",
                    "Curious",
                    "Heroes",
                    "Readers",
                    "Listeners",
                    "Citizens",
                    "Kind Hearts",
                    "Explorers",
                    "Trailblazers",
                    "Story Tellers",
                    "Pioneers",
                    "Performers",
                    "Leaders",
                    "Champions",
                    "Team Players",
                    "Imagineers",
                    "Problem Solvers",
                    "Dreamers",
                    "Thinkers",
                    "Creators",
                    "Generous Givers",
                  ])
                    .map((item) => [" " + item + ".", 2000])
                    .flat()}
                  speed={1}
                  className={`font-bold `}
                  repeat={Infinity}
                />
              </div>
            </Container>
          </div>
        </div>
      </div>
      <AnimateIn>
        <HoverScale>
          <div className="absolute bottom-8 md:bottom-24 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full text-foreground">
            <a href="#head-message">
              <ChevronDown className="w-8 h-8 md:w-12 md:h-12 animate" />
            </a>
          </div>
        </HoverScale>
      </AnimateIn>
    </div>
  );
}
