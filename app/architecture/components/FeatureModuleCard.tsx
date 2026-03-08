/**
 * Feature Module Summary Card
 * Displays a feature module's anatomy in a compact panel.
 */

import { cn } from "@/lib/utils";

export interface FeatureModule {
  name: string;
  color: string;           // Tailwind border-l color class
  flags: string[];
  components: number;
  hooks: number;
  hasApi: boolean;
  hasStore: boolean;
}

interface FeatureModuleCardProps {
  module: FeatureModule;
}

export function FeatureModuleCard({ module }: FeatureModuleCardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-slate-800 bg-slate-900 p-4 border-l-2",
      module.color
    )}>
      {/* Name */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-200 font-mono">
          {module.name}/
        </h4>
        <div className="flex gap-1">
          {module.hasApi   && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-500 border border-slate-700">api</span>}
          {module.hasStore && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-500 border border-slate-700">store</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center rounded bg-slate-800/60 py-1.5">
          <p className="text-lg font-bold text-slate-200 leading-none">{module.components}</p>
          <p className="text-[9px] text-slate-500 mt-0.5">components</p>
        </div>
        <div className="text-center rounded bg-slate-800/60 py-1.5">
          <p className="text-lg font-bold text-slate-200 leading-none">{module.hooks}</p>
          <p className="text-[9px] text-slate-500 mt-0.5">hooks</p>
        </div>
      </div>

      {/* Flags */}
      {module.flags.length > 0 ? (
        <div className="space-y-1">
          <p className="text-[9px] uppercase tracking-widest text-slate-600">Flags owned</p>
          {module.flags.map((flag) => (
            <div key={flag} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-violet-400" />
              <code className="text-[10px] font-mono text-violet-300">{flag}</code>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-slate-600 italic">No flags yet</p>
      )}
    </div>
  );
}
