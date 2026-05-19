interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex-1 overflow-auto">
      {children}
    </div>
  );
}