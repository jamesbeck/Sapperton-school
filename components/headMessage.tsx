"use client";
import Container from "@/components/container";
import { bodoniModa } from "../fonts";
import Image from "next/image";
import { AnimateIn } from "@/utils/animateIn";
import { HeadteacherWelcome, Media, Staff } from "@/payload-types";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function HeadMessage({
  headteacherWelcome,
  helenCooper,
}: {
  headteacherWelcome: HeadteacherWelcome;
  helenCooper: Staff | null;
}) {
  const image = headteacherWelcome.image as Media;
  const helenImage = helenCooper?.image as Media | undefined;

  // Strip title prefix (e.g. "Mrs ", "Mr ", "Dr ") for consistency
  const stripTitle = (name: string) =>
    name.replace(/^(Mrs|Mr|Ms|Miss|Dr|Rev)\.?\s+/i, "");
  const displayName = stripTitle(headteacherWelcome.name);

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
              leadership team
            </span>
          </h2>
        </AnimateIn>

        <div className="flex flex-col justify-center gap-8 md:gap-16">
          <div className="flex flex-col md:flex-row  md:p-0 gap-8 md:gap-16 justify-between">
            <div className="flex-1/2">
              <AnimateIn className="w-full">
                <div className="flex flex-row gap-6 justify-center">
                  {/* Meg Crampton */}
                  <Link
                    href="/our-school/staff/mrs-meg-crampton"
                    className="flex flex-col items-center flex-1 group"
                  >
                    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg">
                      <Image
                        src={image?.url || ""}
                        alt={displayName}
                        width={500}
                        height={600}
                        className="rounded-lg shadow-lg object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        style={{
                          objectPosition: `${image?.focalX}% ${image?.focalY}%`,
                        }}
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-semibold text-lg group-hover:text-sapperton-green transition-colors">
                        {displayName}
                      </p>
                      <p className="text-foreground/70 text-sm">
                        {headteacherWelcome.jobTitle}
                      </p>
                    </div>
                  </Link>

                  {/* Helen Cooper */}
                  <Link
                    href="/our-school/staff/mrs-helen-cooper"
                    className="flex flex-col items-center flex-1 group"
                  >
                    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg">
                      <Image
                        src={helenImage?.url || "/execHead.jpg"}
                        alt="Helen Cooper"
                        width={500}
                        height={600}
                        className="rounded-lg shadow-lg object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        style={
                          helenImage
                            ? {
                                objectPosition: `${helenImage.focalX}% ${helenImage.focalY}%`,
                              }
                            : undefined
                        }
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-semibold text-lg group-hover:text-sapperton-green transition-colors">
                        Helen Cooper
                      </p>
                      <p className="text-foreground/70 text-sm">
                        Executive Headteacher
                      </p>
                    </div>
                  </Link>
                </div>
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
                  <b>{displayName}</b>
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
              {displayName}
            </div>
          </AnimateIn>

          {/* Powell's School Partnership */}
          <AnimateIn>
            <div className="bg-sapperton-green/10 rounded-xl p-8 md:p-12 max-w-3xl mx-auto text-center">
              <h3
                className={`text-2xl md:text-3xl text-sapperton-green ${bodoniModa.className} mb-4`}
              >
                Our Partner School
              </h3>
              <p className="text-foreground/80 mb-6 text-balance leading-relaxed">
                Sapperton Church of England Primary School works in partnership
                with Powell&apos;s Church of England Primary School, sharing
                leadership and a commitment to providing an outstanding
                education for every child.
              </p>
              <Link
                href="https://www.powells.gloucs.sch.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sapperton-green text-white rounded-lg font-semibold hover:bg-sapperton-green/90 transition-colors"
              >
                Visit Powell&apos;s School
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </AnimateIn>
        </div>
      </Container>
    </div>
  );
}
