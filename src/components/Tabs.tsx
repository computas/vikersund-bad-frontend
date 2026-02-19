type Tab = {
  id: string;
  label: string;
  badge?: number;
  description?: string;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const activeDescription = tabs.find((t) => t.id === activeTab)?.description;

  return (
    <div className="mb-6">
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {activeDescription && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {activeDescription}
        </p>
      )}
    </div>
  );
}
