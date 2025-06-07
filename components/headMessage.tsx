"use client";
import Container from "@/components/container";
import { bodoniModa } from "../fonts";
import Image from "next/image";
import { AnimateIn } from "@/utils/animateIn";

export default function HeadMessage() {
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
            <span className={`text-sapperton-green italic `}>Head Teacher</span>
          </h2>
        </AnimateIn>

        <div className="flex flex-col justify-center gap-8 md:gap-16">
          <div className="flex flex-col md:flex-row  md:p-0 gap-8 md:gap-16 justify-between">
            <div className="flex-1/2">
              <AnimateIn className="relative w-full h-full">
                <Image
                  src="/head.png"
                  alt="Head Message"
                  width={1000}
                  height={600}
                  className="rounded-xl shadow-lg/50 shadow-foreground object-cover w-full h-full"
                />
              </AnimateIn>
            </div>

            <div className="text-center text-pretty flex-1/2">
              <AnimateIn>
                <p>
                  I am excited to welcome you to Sapperton C of E Primary
                  School.
                </p>
                <p>
                  Nestled in the heart of the Cotswolds, our small village
                  school is a warm and welcoming community. Through a nurturing
                  environment and rich, varied and creative curriculum, everyone
                  develops faith in each other and ourselves, and are inspired
                  to be successful in everything we do. Our local environment
                  allows us to fully embrace the outdoors and extends our
                  learning into a wide natural space. Providing children with
                  experiences away from the classroom, such as through trips
                  linked to our curricula, residentials, sporting events and
                  music concerts creates excited and aspirational learners.{" "}
                </p>
                <p>
                  The Christian values of love, honour and trust underpin our
                  school and enable all of our community to flourish and learn.
                  Together, we cultivate a spirit of kindness, resilience and
                  ambition that prepares our children for future success.{" "}
                </p>
                <p>
                  We are proud of our school and would welcome you to come and
                  see just how much Sapperton could offer your child.{" "}
                </p>
                <p>
                  <b>Mrs Meg Crampton</b>
                  <br />
                  Head of School
                </p>
              </AnimateIn>
            </div>
          </div>
          <AnimateIn>
            <div
              className={`text-sapperton-green text-3xl md:text-5xl text-center ${bodoniModa.className} flex flex-col text-balance max-w-2xl mx-auto -mb-12`}
            >
              <div className="text-7xl relative top-9 text-left">&ldquo;</div>
              Every child who walks through our doors is known, valued, and
              encouraged to shine.
              <div className="text-7xl  text-right">&rdquo;</div>
            </div>
            <div className="text-foreground text-lg text-center">
              Mrs Meg Crampton
            </div>
          </AnimateIn>
        </div>
      </Container>
    </div>
  );
}
