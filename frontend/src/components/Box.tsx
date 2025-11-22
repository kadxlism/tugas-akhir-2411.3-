import { ReactNode } from "react";

interface BoxProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  className?: string; // opsional, untuk custom style
}

export default function Box({ label, value, icon, className }: BoxProps) {
  return (
    <div
      className={`bg-white shadow-sm rounded-xl p-4 flex flex-col items-center justify-center text-center border border-gray-100 hover:shadow-md transition ${className}`}
    >
      {icon && <div className="mb-2 text-xl text-gray-600">{icon}</div>}
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
    </div>
  );
}
