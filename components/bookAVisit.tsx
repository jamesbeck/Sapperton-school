"use client";
import Container from "@/components/container";
import Button from "@/components/ui/button";
import { bodoniModa } from "../fonts";
import { AnimateIn } from "@/utils/animateIn";

export default function BookAVisit() {
  return (
    <div className="bg-sapperton-green/5">
      <Container>
        <AnimateIn>
          <div className="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
            <h3
              className={`text-2xl md:text-4xl text-sapperton-green ${bodoniModa.className}`}
            >
              Come and see us in action
            </h3>
            <p className="text-foreground text-lg text-balance">
              We&apos;d love to welcome you to Sapperton Primary School.
              There&apos;s no better way to experience the warmth and joy of
              our community than by visiting in person. Please get in touch to
              arrange a visit - we can&apos;t wait to meet you!
            </p>
            <div className="flex justify-center">
              <Button
                label="Book a Visit"
                href="/contact-us#contact-form"
                buttonStyle="green"
              />
            </div>
          </div>
        </AnimateIn>
      </Container>
    </div>
  );
}
