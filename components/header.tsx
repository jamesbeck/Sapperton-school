"use client";
import { Menu, X, Instagram, Facebook, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { HoverScale } from "@/utils/hoverScale";
import { RequestAVisit } from "./requestAVisit";

const menu = [
  {
    name: "Our School",
    href: "/our-school",
    children: [
      {
        name: "About Us",
        href: "/about-us",
      },
      {
        name: "Admissions",
        href: "/admissions",
      },
      {
        name: "Governors",
        href: "/governors",
      },
      {
        name: "PTA",
        href: "/pta",
      },
      {
        name: "Opening Hours",
        href: "/opening-hours",
      },
      {
        name: "Staff",
        href: "/staff",
      },
      {
        name: "Vision",
        href: "/vision",
      },
      {
        name: "Vacancies",
        href: "/vacancies",
      },
      {
        name: "School Council",
        href: "/school-council",
      },
    ],
  },
  {
    name: "Classes",
    href: "/classes",
    children: [
      { name: "Reception", href: "/reception" },
      { name: "Maple", href: "/maple" },
      { name: "Rowan", href: "/rowan" },
      { name: "Elder", href: "/elder" },
    ],
  },
  {
    name: "Curriculum",
    href: "/curriculum",
    children: [
      { name: "Intent", href: "/intent" },
      { name: "Art & Design", href: "/art-and-design" },
      { name: "Computing", href: "/computing" },
      { name: "Design & Technology", href: "/design-and-technology" },
      { name: "Reading", href: "/reading" },
      { name: "Writing", href: "/writing" },
      { name: "EYFS", href: "/eyfs" },
      { name: "Geography", href: "/geography" },
      { name: "History", href: "/history" },
      { name: "Maths", href: "/maths" },
      { name: "Foreign Languages", href: "/foreign-languages" },
      { name: "Music", href: "/music" },
      { name: "PE", href: "/pe" },
      { name: "PHSE", href: "/phse" },
      { name: "RE", href: "/re" },
      { name: "Science", href: "/science" },
    ],
  },
  {
    name: "Parents",
    href: "/parents",
  },
  {
    name: "News & Events",
    href: "/news-and-events",
  },
];

const subMenu = [
  {
    name: "Statuatory Information",
    href: "/statuatory-information",
    children: [
      {
        name: "Policies",
        href: "/policies",
      },
      {
        name: "PP Report",
        href: "/pp-report",
      },
      {
        name: "PE Report",
        href: "/pe-report",
      },
      {
        name: "Ofsted Report",
        href: "/ofsted-report",
      },
      {
        name: "British Values",
        href: "/british-values",
      },
      {
        name: "Safeguarding",
        href: "/safeguarding",
      },
      {
        name: "SEND",
        href: "/send",
      },
      {
        name: "Assessment Data",
        href: "/assessment-data",
      },
    ],
  },
  {
    name: "Other",
    href: "/other",
    children: [
      {
        name: "Privacy Policy",
        href: "/privacy-policy",
      },
      {
        name: "Cookie Policy",
        href: "/cookie-policy",
      },
      {
        name: "Terms & Conditions",
        href: "/terms-and-conditions",
      },
    ],
  },
  {
    name: "Etc",
    href: "/other",
    children: [
      {
        name: "Privacy Policy",
        href: "/privacy-policy",
      },
      {
        name: "Cookie Policy",
        href: "/cookie-policy",
      },
      {
        name: "Terms & Conditions",
        href: "/terms-and-conditions",
      },
    ],
  },
  {
    name: "Etc",
    href: "/other",
    children: [
      {
        name: "Privacy Policy",
        href: "/privacy-policy",
      },
      {
        name: "Cookie Policy",
        href: "/cookie-policy",
      },
      {
        name: "Terms & Conditions",
        href: "/terms-and-conditions",
      },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [vh, setVh] = useState(0);

  //close the open menu section when menu closes
  useEffect(() => {
    if (!open) {
      setOpenSection(null);
    }
  }, [open]);

  const { scrollY } = useScroll();

  useEffect(() => {
    setVh(
      Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      )
    );
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setLogoOpacity(1 - latest / (vh - 100));
  });

  return (
    <>
      <LogoAndMenuButton
        logoOpacity={logoOpacity}
        open={false}
        setOpen={setOpen}
      />

      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <motion.nav
            initial={{ x: "200%" }}
            animate={{ x: "0%" }}
            exit={{ x: "200%" }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-100 h-full w-full"
          >
            <LogoAndMenuButton logoOpacity={1} open={true} setOpen={setOpen} />

            <div className="w-full h-full bg-sapperton-green p-8 pt-24 md:pt-32 md:px-16 overflow-scroll text-white ">
              <div className="w-full mx-auto max-w-7xl min-h-full md:h-full py-4">
                <div className="flex flex-col space-y-8 w-full min-h-full">
                  <div className="flex-1 flex items-center">
                    <div className="w-full md:max-w-md">
                      {menu.map((item, i) => (
                        <div key={i}>
                          <div
                            className={cn(
                              "flex items-center justify-between text-2xl border-white p-2 group duration-300",
                              i == 0 ? "border-t-0" : "border-t-2",
                              openSection === i ? "" : "hover:pl-4"
                            )}
                            onClick={() =>
                              openSection === i
                                ? setOpenSection(null)
                                : setOpenSection(i)
                            }
                          >
                            {item.name}
                            <ChevronRight
                              size={32}
                              className={cn(
                                "group-hover:rotate-90 transition-transform duration-300",
                                openSection === i ? "rotate-90" : ""
                              )}
                            />
                          </div>

                          {item.children && (
                            <motion.div
                              className={"text-lg overflow-hidden"}
                              initial={{ height: 0 }}
                              animate={{
                                height: openSection === i ? "auto" : 0,
                              }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <div className="flex flex-col px-4 pb-4">
                                {item.children.map((child, i) => (
                                  <Link
                                    key={i}
                                    href={child.href}
                                    className="hover:underline"
                                  >
                                    <div>{child.name}</div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="https://www.instagram.com/sappertonprimary/">
                      <div className="bg-white text-sapperton-green rounded-full p-2 hover:bg-sapperton-green hover:text-white transition-colors duration-300 border-2 border-sapperton-green hover:border-white">
                        <Instagram />
                      </div>
                    </Link>
                    <Link href="https://www.facebook.com/people/Sapperton-C-of-E-Primary-School/61558384384875/#">
                      <div className="bg-white text-sapperton-green rounded-full p-2 hover:bg-sapperton-green hover:text-white transition-colors duration-300 border-2 border-sapperton-green hover:border-white">
                        <Facebook className="relative right-[1px]" />
                      </div>
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:gap-8">
                    {subMenu.map((item, i) => (
                      <div key={i}>
                        <Link href={item.href}>
                          <div
                            className={cn(
                              " text-sm border-white border-b-1 p-1"
                            )}
                          >
                            {item.name}
                          </div>
                        </Link>
                        <div className="flex flex-col p-1 pl-2">
                          {item.children.map((child, i) => (
                            <Link
                              key={i}
                              href={child.href}
                              className="hover:underline"
                            >
                              <div className={cn("text-xs pl-1")}>
                                {child.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function LogoAndMenuButton({
  logoOpacity,
  open,
  setOpen,
}: {
  logoOpacity: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <div className={cn("fixed w-full z-100 px-8 md:px-16 pb-4")}>
      <div className="w-full mx-auto max-w-7xl relative h-auto py-4">
        <AnimatePresence>
          <motion.div style={{ opacity: logoOpacity }}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={400}
              height={120}
              className="w-auto h-16 md:h-24"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute right-0 top-0 bg-sapperton-green h-full p-1 flex flex-col justify-end rounded-b-md">
          <HoverScale>
            {!open ? (
              <Menu
                className="text-white"
                size={48}
                onClick={() => setOpen(!open)}
              />
            ) : (
              <X
                className="text-white"
                size={48}
                onClick={() => setOpen(!open)}
              />
            )}
          </HoverScale>
        </div>
      </div>
    </div>
  );
}
