import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-medium ${className}`}
    >
      {children}
    </button>
  );
}