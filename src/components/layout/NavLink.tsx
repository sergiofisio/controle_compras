"use client";

import { useLoadingStore } from "@/store/loadingStore";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

export function NavLink({ href, children, className, ...props }: NavLinkProps) {
  const { showLoading } = useLoadingStore();
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname !== href) {
      showLoading();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
