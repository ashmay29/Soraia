import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="bg-primary text-background relative px-6 py-16 lg:px-12"
      style={{
        backgroundImage: "url('/background/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Image
              src="/logo/name.png"
              alt="Soraia"
              width={822}
              height={303}
              className="mb-4 h-10 w-auto"
            />
            <p className="text-gray text-sm leading-relaxed">
              India&apos;s first modern Indian-European restaurant with an Omakase Bar
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold mb-4 text-xs tracking-[0.2em] uppercase">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#about"
                  className="text-background hover:text-gold transition-colors duration-300"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className="text-background hover:text-gold transition-colors duration-300"
                >
                  Experience
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-background hover:text-gold transition-colors duration-300"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gold mb-4 text-xs tracking-[0.2em] uppercase">Contact</h4>
            <p className="text-background text-sm leading-relaxed">
              Mumbai, India
              <br />
              For reservations and inquiries
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-gold flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-background/70 text-sm">
            © {new Date().getFullYear()} Soraia. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
