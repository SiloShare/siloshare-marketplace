import { Wheat } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 36, text: "text-4xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Wheat size={icon} strokeWidth={1.5} className="text-black" />
      <span className={`font-bold ${text} text-black tracking-tight`}>
        SiloShare
      </span>
    </div>
  );
}

