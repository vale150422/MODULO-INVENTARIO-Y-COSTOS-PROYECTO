export default function Topbar({ title }: { title?: string }) {
  return (
    <div className="h-14 bg-[#111c17] border-b border-[#264d35] 
                    flex items-center justify-between px-6 flex-shrink-0">
      <p className="text-sm font-semibold text-white">{title ?? 'Dashboard'}</p>
    </div>
  );
}