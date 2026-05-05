import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Calculator } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import motorsLogo from "../assets/logo-removebg.png";

/* ================= CSS ================= */
const NavbarStyles = () => (
  <style>
    {`
      @keyframes logoGlow {
        0% {
          filter:
            drop-shadow(0 0 6px rgba(239,68,68,0.35))
            drop-shadow(0 0 18px rgba(239,68,68,0.20));
        }
        50% {
          filter:
            drop-shadow(0 0 14px rgba(239,68,68,0.65))
            drop-shadow(0 0 32px rgba(239,68,68,0.35));
        }
        100% {
          filter:
            drop-shadow(0 0 6px rgba(239,68,68,0.35))
            drop-shadow(0 0 18px rgba(239,68,68,0.20));
        }
      }

      .logo-glow {
        animation: logoGlow 3.2s ease-in-out infinite;
      }

      .nav-link {
        position: relative;
      }

      .nav-link::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -6px;
        height: 2px;
        width: 0%;
        background: linear-gradient(to right, #ef4444, #dc2626);
        transition: width 0.3s ease;
      }

      .nav-link.active::after {
        width: 100%;
      }
    `}
  </style>
);



/* ================= LOGO ================= */
const Logo = () => {
  return (
    <div className="flex items-center">
      <img
        src={motorsLogo}
        alt="Logo"
        className="h-12 w-auto logo-glow"
      />
    </div>
  );
};

/* ================= DESKTOP NAV ================= */
const DesktopNav = ({ navLinks, isActive }: any) => (
  <div className="hidden md:flex items-center gap-8">
    {navLinks.map((link: any) => (
      <Link
        key={link.href}
        to={link.href}
        className={`nav-link text-sm font-medium tracking-wide transition-all duration-300 ${
          isActive(link.href)
            ? "text-red-600 active"
            : "text-gray-600 hover:text-red-600"
        }`}
      >
        {link.label}
      </Link>
    ))}
  </div>
);

/* ================= DESKTOP ACTIONS ================= */
const DesktopActions = () => (
  <div className="hidden md:flex items-center gap-6">

    {/* Phone */}
    <Phone className="w-5 h-5 text-red-600" />

    <div className="leading-tight text-sm">
      <a
        href="tel:+911234567890"
        className="block text-gray-600 hover:text-red-600 transition"
      >
        +91 7000366498
      </a>

      <a
        href="tel:+911234567890"
        className="block text-gray-600 hover:text-red-600 transition"
      >
        +91 9425092196
      </a>
    </div>

    {/* CTA */}
    <Button
      variant="hero"
      className="
        bg-red-600 hover:bg-red-700 text-white 
        px-5 py-2.5 rounded-lg
        shadow-md hover:shadow-lg
        transition-all duration-300
      "
      asChild
    >
      <Link to="/sell">Sell Your Car</Link>
    </Button>
  </div>
);


/* ================= MOBILE MENU ================= */
const MobileMenu = ({ navLinks, isActive, setIsOpen }: any) => (
  <div className="md:hidden bg-white border-t border-gray-100 py-6 animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="flex flex-col items-center gap-4">
      {navLinks.map((link: any) => (
        <Link
          key={link.href}
          to={link.href}
          className={`text-lg font-semibold transition-colors duration-200 flex items-center gap-2 ${
            isActive(link.href)
              ? "text-red-600"
              : "text-gray-700 hover:text-red-600"
          }`}
          onClick={() => setIsOpen(false)}
        >
          {link.label === "EMI Calculator" && (
            <Calculator className="w-5 h-5" />
          )}
          {link.label}
        </Link>
      ))}

      {/* Footer Area inside Menu */}
      <div className="w-full px-6 pt-2 mt-0 border-t border-gray-100 flex flex-col items-center gap-3 ">
        <a
          href="tel:+911234567890"
          className="flex items-center justify-center gap-3 text-red-600 font-bold text-lg hover:scale-105 transition-transform"
        >
          <Phone className="w-5 h-5" />
          +91 7000366498
        </a>

        <Button
          variant="default"
          className="w-full max-w-[280px] bg-red-600 hover:bg-red-700 text-white py-6 text-base rounded-xl shadow-lg shadow-red-200"
          asChild
        >
          <Link to="/sell" onClick={() => setIsOpen(false)}>
            Sell Your Car
          </Link>
        </Button>
      </div>
    </div>
  </div>
);

/* ================= MAIN NAVBAR ================= */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/buy", label: "Buy Car" },
    { href: "/sell", label: "Sell Car" },
    { href: "/emi-calculator", label: "EMI Calculator" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <NavbarStyles />

      <nav className="
        fixed top-0 left-0 right-0 z-50
        bg-white/80 backdrop-blur-xl
        border-b border-gray-200
        shadow-[0_4px_20px_rgba(0,0,0,0.05)]
      ">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-between ">

            <Logo />

            <DesktopNav navLinks={navLinks} isActive={isActive} />

            <DesktopActions />

            {/* MOBILE BUTTON */}
            <div className="md:hidden ">
              <button
                className="p-2 text-gray-800"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {isOpen && (
            <MobileMenu
              navLinks={navLinks}
              isActive={isActive}
              setIsOpen={setIsOpen}
            />
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;