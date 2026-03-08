/**
 * Middleware Flow Diagram
 * Visual SVG-based pipeline showing the edge middleware processing sequence.
 */

import { cn } from "@/lib/utils";

interface StepProps {
  number: number;
  label: string;
  sublabel: string;
  color: string;
  last?: boolean;
}

function Step({ number, label, sublabel, color, last }: StepProps) {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="flex flex-col items-center gap-1">
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
          color
        )}>
          {number}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-200 whitespace-nowrap">{label}</p>
        <p className="text-[10px] text-slate-500 whitespace-nowrap">{sublabel}</p>
      </div>
      {!last && (
        <div className="hidden sm:flex items-center ml-3">
          <div className="h-px w-8 bg-slate-700" />
          <div className="border-l-4 border-l-slate-700 border-y-4 border-y-transparent h-0" />
        </div>
      )}
    </div>
  );
}

interface SeparationOfConcernRowProps {
  layer: string;
  location: string;
  owner: string;
}

function SoCRow({ layer, location, owner }: SeparationOfConcernRowProps) {
  return (
    <tr className="border-b border-slate-800">
      <td className="py-2 pr-4 text-xs text-slate-300 font-medium">{layer}</td>
      <td className="py-2 pr-4">
        <code className="text-[10px] text-violet-300 font-mono">{location}</code>
      </td>
      <td className="py-2 text-[10px] text-slate-500">{owner}</td>
    </tr>
  );
}

export function MiddlewareFlowDiagram() {
  const steps: Omit<StepProps, "last">[] = [
    { number: 1, label: "Request arrives",     sublabel: "Edge Runtime",         color: "bg-slate-600" },
    { number: 2, label: "Parse JWT cookie",    sublabel: "lib/jwt.ts",           color: "bg-sky-700" },
    { number: 3, label: "Authorize route",     sublabel: "lib/auth/route-rules", color: "bg-sky-600" },
    { number: 4, label: "Resolve flags",       sublabel: "Edge Config ≤15ms",    color: "bg-violet-700" },
    { number: 5, label: "Write flag cookies",  sublabel: "__flag_* 60s TTL",     color: "bg-violet-600" },
    { number: 6, label: "NextResponse.next()", sublabel: "RSC renders",          color: "bg-emerald-700" },
  ];

  const socRows: SeparationOfConcernRowProps[] = [
    { layer: "Route enforcement",    location: "middleware.ts + route-rules.ts", owner: "Platform team" },
    { layer: "Role-based UI",        location: "src/roles/{role}/",              owner: "Role teams" },
    { layer: "Business logic",       location: "src/features/{feature}/",        owner: "Feature teams" },
    { layer: "Flag declarations",    location: "src/shared/flags/flags.ts",      owner: "Platform team" },
    { layer: "Per-feature flags",    location: "src/features/{f}/flags.ts",      owner: "Feature teams" },
    { layer: "UI primitives",        location: "src/shared/ui/",                 owner: "Design system" },
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Edge Middleware Pipeline
        </h3>
        <div className="flex flex-wrap gap-y-4 gap-x-0 items-center overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <Step key={step.label} {...step} last={i === steps.length - 1} />
          ))}
        </div>
      </div>

      {/* Separation of Concerns */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Separation of Concerns
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left pb-2 text-[10px] uppercase tracking-widest text-slate-500 pr-4">Concern</th>
                <th className="text-left pb-2 text-[10px] uppercase tracking-widest text-slate-500 pr-4">Location</th>
                <th className="text-left pb-2 text-[10px] uppercase tracking-widest text-slate-500">Owner</th>
              </tr>
            </thead>
            <tbody>
              {socRows.map((row) => (
                <SoCRow key={row.layer} {...row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
