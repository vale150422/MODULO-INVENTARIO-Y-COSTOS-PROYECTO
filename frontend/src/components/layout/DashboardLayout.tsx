import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}