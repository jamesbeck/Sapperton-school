"use client";

import { bodoniModa } from "@/fonts";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const DISMISSED_COOKIE = "sapperton_places_september_2026_dismissed";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

function hasDismissedPopup() {
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${DISMISSED_COOKIE}=`));
}

export default function AdmissionsPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (hasDismissedPopup()) return;

    const showTimer = window.setTimeout(() => setIsOpen(true), 700);
    return () => window.clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const dismiss = () => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${DISMISSED_COOKIE}=true; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[#102c24]/75 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) dismiss();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admissions-popup-title"
            aria-describedby="admissions-popup-description"
            className="relative w-full max-w-4xl overflow-hidden rounded-[1.75rem] bg-[#fbf8f0] shadow-[0_30px_100px_rgba(0,0,0,0.38)]"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={dismiss}
              aria-label="Close admissions announcement"
              className="absolute right-3 top-3 z-20 grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white/95 text-[#244d40] shadow-md transition hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sapperton-green sm:right-5 sm:top-5"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="grid md:grid-cols-[0.8fr_1.2fr]">
              <div className="relative hidden min-h-[570px] overflow-hidden bg-sapperton-green p-10 text-white md:flex md:flex-col md:justify-between">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/15" />
                <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full border border-white/15" />
                <Sparkles className="relative h-8 w-8 text-[#f2d488]" aria-hidden="true" />

                <div className="relative">
                  <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
                    Sapperton C of E Primary School
                  </p>
                  <p className={`${bodoniModa.className} text-4xl leading-[1.08]`}>
                    Small school.
                    <br />
                    <span className="italic text-[#f2d488]">Big possibilities.</span>
                  </p>
                </div>

                <Image
                  src="/church.png"
                  alt=""
                  width={360}
                  height={360}
                  className="pointer-events-none absolute -bottom-16 -right-20 w-80 opacity-[0.12] brightness-0 invert"
                />
              </div>

              <div className="px-6 pb-7 pt-16 sm:px-10 sm:pb-10 sm:pt-14 md:p-14 md:pr-16">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e7efe8] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-sapperton-green sm:text-sm">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Places for September 2026
                </div>

                <h2
                  id="admissions-popup-title"
                  className={`${bodoniModa.className} text-[2.35rem] leading-[1.04] tracking-tight text-[#183d32] sm:text-5xl`}
                >
                  There&apos;s room to grow at Sapperton
                </h2>

                <p
                  id="admissions-popup-description"
                  className="mt-5 text-base leading-7 text-[#496159] sm:text-lg sm:leading-8"
                >
                  We have a small number of places available in selected year
                  groups, including our preschool. For enquiries or more
                  information while the school office is closed over the
                  summer, please get in touch with Meg Crampton, Head of School.
                </p>

                <a
                  href="mailto:m.crampton@sapperton.gloucs.sch.uk?subject=September%202026%20place%20enquiry"
                  className="mt-7 flex w-full items-center justify-between gap-4 rounded-2xl bg-sapperton-green px-5 py-4 text-white shadow-lg shadow-[#347560]/20 transition hover:-translate-y-0.5 hover:bg-[#2b6552] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sapperton-green focus-visible:ring-offset-2 sm:px-6"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block font-bold">Email Meg Crampton</span>
                      <span className="block truncate text-xs text-white/75 sm:text-sm">
                        m.crampton@sapperton.gloucs.sch.uk
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={dismiss}
                  className="mx-auto mt-5 block cursor-pointer text-sm font-medium text-[#62756e] underline decoration-[#62756e]/40 underline-offset-4 transition hover:text-[#183d32]"
                >
                  Don&apos;t show this again
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
