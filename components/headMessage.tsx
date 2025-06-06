"use client";
import Container from "@/components/container";
import { bodoniModa } from "../fonts";
import Image from "next/image";
import { motion } from "framer-motion";

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
        <motion.div
          initial={{ opacity: 0, top: -50 }}
          whileInView={{ opacity: 1, top: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="relative"
        >
          <h2
            className={`text-4xl md:text-7xl tracking-tighter ${bodoniModa.className} text-center md:mb-16 mb-8 text-balance leading-tight`}
          >
            A warm welcome from our <br />
            <span className={`text-sapperton-green italic `}>Head Teacher</span>
          </h2>
        </motion.div>

        <div className="flex flex-col justify-center gap-8 md:gap-16">
          <div className="flex flex-col md:flex-row  md:p-0 gap-8 md:gap-16 justify-between">
            <div className="flex-1/2">
              <motion.div
                initial={{ opacity: 0, top: -50 }}
                whileInView={{ opacity: 1, top: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                className="relative"
              >
                <Image
                  src="/head.png"
                  alt="Head Message"
                  width={1000}
                  height={600}
                  className="rounded-xl shadow-lg/50 shadow-foreground"
                />
              </motion.div>
            </div>

            <div className="text-center text-pretty flex-1/2">
              <motion.div
                initial={{ opacity: 0, top: -50 }}
                whileInView={{ opacity: 1, top: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                className="relative"
              >
                <p>
                  At the heart of our community lies a vibrant school where
                  curiosity is celebrated, kindness is nurtured, and every child
                  is encouraged to flourish. We believe that education is more
                  than just academics – it’s about building confidence,
                  fostering creativity, and preparing young minds to make a
                  meaningful impact in the world.
                </p>

                <p>
                  Our dedicated team is passionate about creating a warm,
                  inclusive environment where pupils feel safe, supported, and
                  inspired to reach their full potential. We work closely with
                  families to ensure that each child’s journey is personal,
                  purposeful, and full of promise.
                </p>

                <p>
                  Whether you’re new to the area or simply seeking a school that
                  feels like home, we invite you to discover the spirit,
                  ambition, and care that define our school. Together, we can
                  shape a future full of opportunity.
                </p>
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, top: -50 }}
            whileInView={{ opacity: 1, top: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            className="relative"
          >
            <div
              className={`text-sapperton-green text-3xl md:text-5xl text-center ${bodoniModa.className} flex flex-col text-balance max-w-2xl mx-auto `}
            >
              <div className="text-7xl relative top-9 text-left">&ldquo;</div>
              Every child who walks through our doors is known, valued, and
              encouraged to shine.
              <div className="text-7xl  text-right">&rdquo;</div>
            </div>
          </motion.div>
        </div>
        <p></p>
      </Container>
    </div>
  );
}
