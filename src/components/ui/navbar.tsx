"use client";
import { Settings } from "lucide-react";
import { User } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const Navbar = () => {
  return (
    <div>
      <nav className="bg-slate-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link
            href="https://jpm.pt/pt/inicio/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              src="https://jpm.pt/wp-content/uploads/2017/10/cropped-JPM-LOGO-5.png"
              className="h-8"
              alt="JPM Logo"
            />
          </Link>
          <Link href="/" className="text-white">
            HOME
          </Link>
          <Link href="">
            <User color="white" />
          </Link>
          <Link href="opcoes">
            <Settings color="white" />
          </Link>
        </div>
      </nav>
      <div className="bg-lime-500 h-1" />
    </div>
  );
};

export default Navbar;
