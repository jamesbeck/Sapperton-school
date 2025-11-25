"use client";
import { shuffleArray } from "@/utils/shuffleArray";
import Container from "@/components/container";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { bodoniModa } from "@/fonts";
import { ChevronDown, CalendarHeart } from "lucide-react";
import { AnimateIn } from "@/utils/animateIn";
import { HoverScale } from "@/utils/hoverScale";
import { HeroWord, Event } from "@/payload-types";

export default function Hero({
  words,
  openDays,
}: {
  words: HeroWord;
  openDays: Event[];
}) {
  const scrollToOpenDays = () => {
    document
      .getElementById("open-days")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const nextOpenDay = openDays[0];

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
              <div className="flex flex-col gap-8">
                <div
                  className={`text-3xl md:text-7xl text-white font-extralight tracking-tighter ${bodoniModa.className}`}
                >
                  Inspiring young minds <br /> to become
                  <TypeAnimation
                    sequence={shuffleArray(words.words)
                      .map((item) => [" " + item.word + ".", 2000])
                      .flat()}
                    speed={1}
                    className={`font-bold `}
                    repeat={Infinity}
                  />
                </div>
                {nextOpenDay && (
                  <AnimateIn>
                    <button
                      onClick={scrollToOpenDays}
                      className="bg-white text-sapperton-green px-4 py-3 md:px-6 md:py-4 rounded-lg font-bold text-base md:text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 md:gap-3 w-fit group cursor-pointer"
                    >
                      <CalendarHeart className="w-5 h-5 md:w-7 md:h-7 group-hover:animate-pulse" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm md:text-base leading-tight">
                          Join Us at Our Open Day
                        </span>
                        <span className="text-xs md:text-sm font-normal opacity-90 leading-tight">
                          {formatDate(nextOpenDay.date)}
                        </span>
                      </div>
                    </button>
                  </AnimateIn>
                )}
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
