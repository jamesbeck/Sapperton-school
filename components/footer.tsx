import Container from "./container";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { bodoniModa } from "@/fonts";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-16">
      <Container colour="green">
        <p
          className={`text-white text-2xl md:text-3xl text-center mb-8 italic ${bodoniModa.className}`}
        >
          To nurture faith; to inspire success
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Contact Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Contact Us</h3>
            <div className="flex flex-col gap-3 text-white/90">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">
                    Sapperton C of E Primary School
                  </div>
                  <div>Sapperton</div>
                  <div>Cirencester</div>
                  <div>Gloucestershire</div>
                  <div>GL7 6LQ</div>
                </div>
              </div>
              <a
                href="tel:01285760325"
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>01285 760325</span>
              </a>
              <a
                href="mailto:admin@sapperton.gloucs.sch.uk"
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>admin@sapperton.gloucs.sch.uk</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Quick Links</h3>
            <div className="flex flex-col gap-2 text-white/90">
              <Link
                href="/contact-us"
                className="hover:text-white hover:underline transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/news"
                className="hover:text-white hover:underline transition-colors"
              >
                News
              </Link>
              <Link
                href="/events"
                className="hover:text-white hover:underline transition-colors"
              >
                Events
              </Link>
              <Link
                href="/classes"
                className="hover:text-white hover:underline transition-colors"
              >
                Classes
              </Link>
            </div>
          </div>

          {/* Social Media & Ofsted */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Follow Us</h3>
            <div className="flex gap-4">
              <Link
                href="https://www.instagram.com/sappertonprimary/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-sapperton-green rounded-full p-3 hover:bg-sapperton-green hover:text-white transition-colors duration-300 border-2 border-white"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-6 h-6" />
              </Link>
              <Link
                href="https://www.facebook.com/people/Sapperton-C-of-E-Primary-School/61558384384875/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-sapperton-green rounded-full p-3 hover:bg-sapperton-green hover:text-white transition-colors duration-300 border-2 border-white"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-6 h-6" />
              </Link>
            </div>

            {/* Ofsted Report Link */}
            <div className="mt-4">
              <Link
                href="https://reports.ofsted.gov.uk/provider/21/115698"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white p-3 rounded-lg transition-opacity hover:opacity-80"
                aria-label="View our Ofsted report"
              >
                <Image
                  src="/ofsted.png"
                  alt="Ofsted"
                  width={100}
                  height={100}
                  className="w-20 h-auto sm:w-24"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/80 text-sm">
          <p>
            © {currentYear} Sapperton C of E Primary School. All rights
            reserved.
          </p>
        </div>
      </Container>
    </div>
  );
}
