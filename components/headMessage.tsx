"use client";
import Container from "@/components/container";
import { bodoniModa } from "../fonts";
import Image from "next/image";
import { AnimateIn } from "@/utils/animateIn";
import { HeadteacherWelcome, Media } from "@/payload-types";
import { useState, useRef, useEffect } from "react";
import ExecHeadQuote from "@/components/execHeadQuote";

export default function HeadMessage({
  headteacherWelcome,
}: {
  headteacherWelcome: HeadteacherWelcome;
}) {
  const image = headteacherWelcome.image as Media;
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Split body into paragraphs (separated by double newlines or single newlines)
  const paragraphs = headteacherWelcome.body
    .split(/\n\n|\n/)
    .filter((p) => p.trim());
  const firstTwoParagraphs = paragraphs.slice(0, 2).join("<br /><br />");
  const remainingParagraphs = paragraphs.slice(2).join("<br /><br />");
  const hasMoreContent = paragraphs.length > 2;

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [remainingParagraphs]);

  return (
    <div id="head-message">
      <Container>
        <div className="flex justify-center mb-8">
          <Image
            src="/church.png"
            alt="Church"
            width={100}
            height={100}
            className=""
          />
        </div>
        <AnimateIn>
          <h2
            className={`text-4xl md:text-7xl tracking-tighter ${bodoniModa.className} text-center md:mb-16 mb-8 text-balance leading-tight`}
          >
            A warm welcome from our <br />
            <span className={`text-sapperton-green italic `}>
              {headteacherWelcome.jobTitle}
            </span>
          </h2>
        </AnimateIn>

        <div className="flex flex-col justify-center gap-8 md:gap-16">
          <div className="flex flex-col md:flex-row  md:p-0 gap-8 md:gap-16 justify-between">
            <div className="flex-1/2">
              <AnimateIn className="w-full h-[500px] relative">
                <Image
                  src={image?.url || ""}
                  alt="Head Message"
                  width={1000}
                  height={600}
                  className="rounded-md shadow-lg/50 shadow-foreground object-cover w-full h-full"
                  style={{
                    objectPosition: `${image?.focalX}% ${image?.focalY}%`,
                  }}
                />
              </AnimateIn>
            </div>

            <div className="text-center text-pretty flex-1/2">
              <AnimateIn>
                {/* First two paragraphs - always visible */}
                <div
                  className="pb-4"
                  dangerouslySetInnerHTML={{
                    __html: firstTwoParagraphs,
                  }}
                />

                {/* Remaining paragraphs - collapsible with animation */}
                {hasMoreContent && (
                  <>
                    <div
                      className="overflow-hidden transition-all duration-500 ease-in-out"
                      style={{
                        maxHeight: isExpanded ? `${contentHeight}px` : "0px",
                        opacity: isExpanded ? 1 : 0,
                      }}
                    >
                      <div ref={contentRef}>
                        <div
                          className="pb-4"
                          dangerouslySetInnerHTML={{
                            __html: remainingParagraphs,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-sapperton-green hover:text-sapperton-green/80 font-medium transition-colors duration-200 mb-4 cursor-pointer"
                    >
                      {isExpanded ? "Read less ↑" : "Read more ↓"}
                    </button>
                  </>
                )}

                <div className="pt-4">
                  <b>{headteacherWelcome.name}</b>
                  <br />
                  {headteacherWelcome.jobTitle}
                </div>
              </AnimateIn>
            </div>
          </div>
          <AnimateIn>
            <div
              className={`text-sapperton-green text-3xl md:text-5xl text-center ${bodoniModa.className} flex flex-col text-balance max-w-2xl mx-auto -mb-12`}
            >
              <div className="text-7xl relative top-9 text-left">&ldquo;</div>
              {headteacherWelcome.quote}
              <div className="text-7xl  text-right">&rdquo;</div>
            </div>
            <div className="text-foreground text-lg text-center">
              {headteacherWelcome.name}
            </div>
          </AnimateIn>

          {/* Executive Headteacher Quote */}
          <ExecHeadQuote />
        </div>
      </Container>
    </div>
  );
}
