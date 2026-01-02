import Banner from "@/components/banner";
import Container from "@/components/container";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";
import H2 from "@/components/ui/h2";
import ContactForm from "@/components/contactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div>
      <Banner url={"/defaultBanner.jpg"} focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[{ label: "Contact Us", url: "/contact-us" }]} />

      {/* Introduction Section */}
      <Container>
        <div className="flex flex-col gap-6 text-center max-w-3xl mx-auto">
          <H1>Get in Touch</H1>
          <p className="text-lg text-gray-700">
            We&apos;d love to hear from you! Whether you have a question about
            our school, want to arrange a visit, or need any information, our
            team is here to help.
          </p>
        </div>
      </Container>

      {/* Contact Information & Map Section */}
      <Container colour="green">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="flex flex-col gap-8">
            <H2>Contact Information</H2>

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-full p-3 flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg mb-1">Address</h3>
                  <p className="text-white/90">
                    Sapperton C of E Primary School
                    <br />
                    Sapperton
                    <br />
                    Cirencester
                    <br />
                    Gloucestershire
                    <br />
                    GL7 6LQ
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-full p-3 flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Phone</h3>
                  <a
                    href="tel:01285760325"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    01285 760325
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-full p-3 flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <a
                    href="mailto:admin@sapperton.gloucs.sch.uk"
                    className="text-white/90 hover:text-white transition-colors break-all"
                  >
                    admin@sapperton.gloucs.sch.uk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-full p-3 flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg mb-1">School Hours</h3>
                  <p className="text-white/90">
                    Monday - Friday
                    <br />
                    8:45 AM - 3:15 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="flex flex-col gap-4">
            <H2>Find Us</H2>
            <div className="w-full h-[400px] lg:h-full rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3214.5936585490035!2d-2.0820948229024525!3d51.727928294568514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4871123562e90e4b%3A0x6f739c7d886783a1!2sSapperton%20C%20of%20E%20Primary%20School!5e1!3m2!1sen!2suk!4v1759414089162!5m2!1sen!2suk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sapperton C of E Primary School Location"
              ></iframe>
            </div>
          </div>
        </div>
      </Container>

      {/* Contact Form Section */}
      <Container>
        <div id="contact-form" className="max-w-3xl mx-auto scroll-mt-8">
          <div className="text-center mb-8">
            <H2>Send Us a Message</H2>
            <p className="text-gray-600 mt-4">
              Fill out the form below and we&apos;ll get back to you as soon as
              possible.
            </p>
          </div>
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
