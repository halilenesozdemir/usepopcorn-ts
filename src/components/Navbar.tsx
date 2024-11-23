import { Logo } from "./Logo";

export function Navbar({ children }: { children: React.ReactNode }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
