import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navigationMenuItems = [
  { title: "Features", href: "#feature" },
  { title: "Use Cases", href: "#usecase" },
  { title: "Pricing", href: "#pricing" },
  { title: "FAQ's", href: "#faq" },
  { title: "About Us", href: "#about" },
  { title: "Contact Us", href: "#contactus" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 10) {
        setScrolledDown(true);
      } else {
        setScrolledDown(false);
      }

      if (currentScrollY < lastScrollY) {
        // Scrolling Up
        setHideNavbar(false);
      } else {
        // Scrolling Down
        setHideNavbar(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`flex items-center justify-between px-4 md:px-16 py-4 container mx-auto sticky bg-[var(--bg-surface)]/80 backdrop-blur-xl z-50 border-b transition-all duration-300
            ${scrolledDown ? "border-[var(--border-default)] dark:border-teal-900/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(20,184,166,0.15)]" : "border-[var(--border-subtle)]"}
            ${hideNavbar ? "top-0" : "top-0"}
          `}
    >
      <NavLink to="/" className="flex items-center gap-x-3 shrink-0">
        <Logo className="text-xl md:text-2xl hover:opacity-90 transition-opacity duration-150" />
      </NavLink>
      <div className="hidden md:flex items-center gap-x-6">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-x-1">
            {navigationMenuItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <a
                    className="text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                    href={item.href}
                  >
                    {item.title}
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-x-2">
          <ThemeToggle />
          <Link to="/login">
            <Button className="rounded-lg text-[var(--text-secondary)] text-sm font-medium bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-inset)] hover:text-[var(--text-primary)] cursor-pointer transition-colors duration-150 px-5 h-9">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="rounded-lg text-white text-sm font-medium bg-[#0d9488] hover:bg-[#0f766e] cursor-pointer transition-colors duration-150 px-5 h-9">
              Get Started <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center gap-x-2">
        <ThemeToggle />
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[var(--text-primary)]">
          {mobileMenuOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Menu className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-[var(--bg-surface)] border-b border-[var(--border-default)] shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col items-center gap-y-4 py-6 z-50">
          {navigationMenuItems.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.title}
            </a>
          ))}
          <Link to="/login" className="w-[80%]">
            <Button
              className="w-full rounded-lg text-[var(--text-secondary)] text-sm font-medium bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-inset)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Button>
          </Link>
          <Link to="/signup" className="w-[80%]">
            <Button
              className="w-full rounded-lg text-white text-sm font-medium bg-[#0d9488] hover:bg-[#0f766e]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
