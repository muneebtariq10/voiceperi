import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
// import logo from '../assets/ellipse119.png'
import logo from "../assets/logo1.png";
import { Button } from "./ui/button";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navigationMenuItems = [
  { title: "Features", href: "#feature" },
  { title: "Use Cases", href: "#usecase" },
  { title: "Pricing", href: "#pricing" },
  { title: "FAQ's", href: "#faq" },
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
      className={`flex items-center justify-between px-4 md:px-[80px] py-5 container mx-auto sticky bg-white z-50 rounded-b-2xl transition-all duration-300 
            ${scrolledDown ? "shadow-md" : ""}
            ${hideNavbar ? "top-0" : "top-0"}
          `}
    >
      {/* <NavLink to="/" className="flex items-center justify-between gap-x-3">
                <img className="w-[40px]" src={logo} alt="logo" />
                <span className="text-xl font-semibold text-primary">VoicePeri</span>
            </NavLink> */}
      <NavLink to="/" className="flex items-center justify-between gap-x-3">
        <img className="w-[40%] md:w-[30%]" src={logo} alt="logo" />
      </NavLink>
      <div className="hidden md:flex items-center gap-x-8">
        <NavigationMenu>
          <NavigationMenuList className=" flex items-center justify-between  gap-x-8">
            {navigationMenuItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <a
                    className="text-[18px] font-normal text-default-gray"
                    href={item.href}
                  >
                    {item.title}
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center justify-between gap-x-3">
          <Link to="/login">
            <Button className="rounded-[20px] text-primary text-base font-semibold bg-secondary hover:bg-primary hover:text-secondary cursor-pointer">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="rounded-[20px] text-secondary text-base font-semibold bg-default-purple cursor-pointer">
              Get Started <ArrowUpRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? (
            <X className="w-8 h-8" />
          ) : (
            <Menu className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[80px] left-0 w-full bg-white rounded-b-2xl shadow-md flex flex-col items-center gap-y-6 py-6 z-50">
          {navigationMenuItems.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="text-[18px] font-semibold text-default-gray"
              onClick={() => setMobileMenuOpen(false)} // close after click
            >
              {item.title}
            </a>
          ))}
          <Link to="/login" className="w-[80%]">
            <Button
              className="w-full rounded-[20px] text-primary text-base font-semibold bg-secondary hover:bg-primary hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Button>
          </Link>
          <Link to="/signup" className="w-[80%]">
            <Button
              className="w-full rounded-[20px] text-secondary text-base font-semibold bg-default-purple"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started <ArrowUpRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
