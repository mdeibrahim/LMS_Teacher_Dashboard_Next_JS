import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({
  label,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-700 font-medium">
        {label}
      </label>

      <input
        {...props}
        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    </div>
  );
}