export default function Footer() {
  return (
    <footer className="bg-accent text-background px-6 py-16 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="mb-4 font-serif text-3xl">Soraia</h3>
            <p className="text-gray text-sm leading-relaxed">
              India&apos;s first modern Indian-European restaurant with an Omakase Bar
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-secondary mb-4 text-sm tracking-widest uppercase">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#about"
                  className="text-background hover:text-secondary transition-colors duration-300"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className="text-background hover:text-secondary transition-colors duration-300"
                >
                  Experience
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-background hover:text-secondary transition-colors duration-300"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-secondary mb-4 text-sm tracking-widest uppercase">Contact</h4>
            <p className="text-background text-sm leading-relaxed">
              Mumbai, India
              <br />
              For reservations and inquiries
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-primary flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-gray text-sm">
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
