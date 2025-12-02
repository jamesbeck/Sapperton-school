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
import { GroupedMenuItem } from "@/types";
import { Class } from "@/payload-types";

export default function Header({
  menuItems,
  footerMenuItems,
  classes,
}: {
  menuItems: GroupedMenuItem[];
  footerMenuItems: GroupedMenuItem[];
  classes: Class[];
}) {
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
                      {menuItems.map((item, i) => (
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
                            {item.title}
                            <ChevronRight
                              size={32}
                              className={cn(
                                "group-hover:rotate-90 transition-transform duration-300",
                                openSection === i ? "rotate-90" : ""
                              )}
                            />
                          </div>

                          {/*CLASSES INJECTION */}
                          {item.title == "Our Classes" && (
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
                                {classes.map((schoolClass, i) => (
                                  <Link
                                    key={i}
                                    href={`/classes/${schoolClass.slug}`}
                                    className="hover:underline"
                                    onClick={() => setOpen(false)}
                                  >
                                    <div>{schoolClass.name}</div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}

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
                                    onClick={() => setOpen(false)}
                                  >
                                    <div>{child.title}</div>
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
                    {footerMenuItems.map((item, i) => (
                      <div key={i}>
                        <Link href={item.href}>
                          <div
                            className={cn(
                              " text-sm border-white border-b-1 p-1"
                            )}
                          >
                            {item.title}
                          </div>
                        </Link>
                        <div className="flex flex-col p-1 pl-2">
                          {item.children.map((child, j) => (
                            <Link
                              key={j}
                              href={child.href}
                              className="hover:underline"
                            >
                              <div className={cn("text-xs pl-1")}>
                                {child.title}
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
            <Link href="/" className="block select-none" draggable="false">
              <Image
                src="/logo.png"
                alt="Logo"
                width={400}
                height={120}
                className="w-auto h-16 md:h-24 pointer-events-none"
                draggable="false"
              />
            </Link>
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
