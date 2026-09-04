import Image from "next/image";
import Link from "next/link";

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
                <Link
                  href="/#about"
                  className="text-background hover:text-gold transition-colors duration-300"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/#experience"
                  className="text-background hover:text-gold transition-colors duration-300"
                >
                  Experience
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-background hover:text-gold transition-colors duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gold mb-4 text-xs tracking-[0.2em] uppercase">Contact</h4>
            <p className="text-background text-sm leading-relaxed">
              Royal Western India Turf Club
              <br />
              Mahalaxmi Race Course, Mahalaxmi
              <br />
              Mumbai, Maharashtra 400011
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-gold flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-background/70 text-sm">
            © {new Date().getFullYear()} Innercircle Hospitality LLP. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/legal?tab=about"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              About Us
            </Link>
            <Link
              href="/legal?tab=contact"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              Contact Us
            </Link>
            <Link
              href="/legal?tab=terms"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/legal?tab=return-policy"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              Return Policy
            </Link>
            <Link
              href="/legal?tab=privacy"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <a
              href="https://eigensu.in"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              Designed & Developed by @Eigensu
            </a>
            <a
              href="https://eigensu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray hover:text-background text-sm transition-colors duration-300"
            >
              Powered by Eigensu
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
