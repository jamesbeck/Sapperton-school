"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const AssistantPlacement = createContext<{
  inlineTarget: HTMLDivElement | null;
  setInlineTarget: (target: HTMLDivElement | null) => void;
}>({ inlineTarget: null, setInlineTarget: () => {} });

export function AssistantPlacementProvider({ children }: { children: ReactNode }) {
  const [inlineTarget, setInlineTarget] = useState<HTMLDivElement | null>(null);

  return (
    <AssistantPlacement.Provider value={{ inlineTarget, setInlineTarget }}>
      {children}
    </AssistantPlacement.Provider>
  );
}

export const useAssistantPlacement = () => useContext(AssistantPlacement);

export function InlineAssistant() {
  const { setInlineTarget } = useAssistantPlacement();

  return (
    <section
      id="ask-sapperton"
      aria-labelledby="ask-sapperton-heading"
      className="scroll-mt-24 bg-[#edf2ed] px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:pt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-sapperton-green">
            A little help finding your way
          </p>
          <h2
            id="ask-sapperton-heading"
            className="font-[family-name:var(--font-bodoni-moda)] text-4xl leading-tight tracking-tight text-[#173d32] sm:text-5xl"
          >
            Your questions.<br />A warm welcome.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">
            Getting to know our school, or looking for something specific?
            Ask about school life, admissions, clubs and more.
          </p>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
            Keep exploring — your conversation stays with you. Open Ask Sapperton
            on any page to pick up where you left off.
          </p>
        </div>
        <div ref={setInlineTarget} className="min-h-[30rem] min-w-0" />
      </div>
    </section>
  );
}
