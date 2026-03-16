import React, { forwardRef } from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", title }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
