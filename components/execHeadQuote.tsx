"use client";
import Container from "@/components/container";
import { bodoniModa } from "../fonts";
import Image from "next/image";
import { AnimateIn } from "@/utils/animateIn";

export default function ExecHeadQuote() {
  return (
    <div className="bg-sapperton-green/5">
      <Container>
        <AnimateIn>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="shrink-0">
              <Image
                src="/execHead.jpg"
                alt="Helen Cooper - Executive Headteacher"
                width={150}
                height={150}
                className="rounded-full shadow-lg object-cover w-32 h-32 md:w-40 md:h-40"
              />
            </div>
            <div className="flex flex-col gap-4 text-center flex-1">
              <div
                className={`text-sapperton-green text-xl md:text-2xl ${bodoniModa.className} italic text-balance leading-relaxed`}
              >
                <span className="text-3xl">&ldquo;</span>I am delighted to be
                part of Sapperton School. It is a small, aspirational school
                with ambition for all. Children experience a rich, varied and
                vibrant curriculum allowing them to flourish.
                <span className="text-3xl">&rdquo;</span>
              </div>
              <div className="text-foreground text-sm md:text-base">
                <span className="font-semibold">Helen Cooper</span>
                <span className="text-foreground/70">
                  {" "}
                  — Executive Headteacher, Sapperton and Powell&apos;s C of E
                  Primary Schools
                </span>
              </div>
            </div>
          </div>
        </AnimateIn>
      </Container>
    </div>
  );
}
