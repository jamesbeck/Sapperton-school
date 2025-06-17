"use client";
import Container from "@/components/container";
import { bodoniModa } from "../fonts";
import Image from "next/image";
import { AnimateIn } from "@/utils/animateIn";
import { HeadteacherWelcome, Media } from "@/payload-types";

export default function HeadMessage({
  headteacherWelcome,
}: {
  headteacherWelcome: HeadteacherWelcome;
}) {
  const image = headteacherWelcome.image as Media;

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
                {/* convert new lines into br */}
                <div
                  className="pb-8"
                  dangerouslySetInnerHTML={{
                    __html: headteacherWelcome.body.replace(/\n/g, "<br />"),
                  }}
                />
                <div>
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
        </div>
      </Container>
    </div>
  );
}
