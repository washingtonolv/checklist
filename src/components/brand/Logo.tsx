import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  href = "/painel",
  className
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}) {
  const widths = { sm: 132, md: 178, lg: 300 };
  const image = (
    <Image
      src="/brand/logo-dd.png"
      alt="D&D Checklist Operacional"
      width={widths[size]}
      height={Math.round(widths[size] / 3)}
      priority={size === "lg"}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
  if (!href) return image;
  return (
    <Link href={href} aria-label="Ir para o painel" className="inline-flex">
      {image}
    </Link>
  );
}

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo-dd-mark.png"
      alt="D&D"
      width={size}
      height={size}
      className={cn("rounded-xl", className)}
    />
  );
}

