const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about-us", label: "About Us" },
  { href: "#products", label: "Products" },
  { href: "#contact-us", label: "Contact Us" },
];
export default function Nav() {
  const homeLink = navLinks[0];
  return (
    <header class="px-24 py-8 absolute z-10 w-full">
      <nav class="flex justify-between items-center max-container">
        <a href={homeLink.href} class="italic font-light text-2xl md:hidden">
          {homeLink.label}
        </a>
        <ul class="flex-1 flex justify-center items-center gap-16 max-md:hidden">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                class="font-light leading-normal text-lg text-slate-400"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div class="cursor-pointer md:hidden">
          <span class="select-none text-2xl" alt="Hamburger">🍔</span>
        </div>
      </nav>
    </header>
  );
}
