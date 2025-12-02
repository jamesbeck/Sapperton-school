import Container from "./container";
import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-16">
      <Container colour="green">
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

          {/* Social Media */}
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
