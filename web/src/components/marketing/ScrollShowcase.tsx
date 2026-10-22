import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Reveal } from './Reveal';

export interface ShowcaseStep {
  id: string;
  kicker: string;
  title: string;
  body: string;
  preview: ReactNode;
}

export function ScrollShowcase({ steps }: { steps: ShowcaseStep[] }) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.findIndex((el) => el === entry.target);
            if (index >= 0) setActive(index);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-14">
      <ol className="lg:py-[18vh]">
        {steps.map((step, i) => (
          <li
            key={step.id}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="py-8 lg:min-h-[52vh] lg:py-16"
          >
            <Reveal variant={i % 2 === 0 ? 'left' : 'right'}>
              <span className="inline-flex items-center rounded-full border border-border bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {step.kicker}
              </span>
              <h3 className={`mt-4 text-2xl font-extrabold transition-colors duration-300 ${active === i ? 'text-text' : 'text-text-muted'}`}>
                {step.title}
              </h3>
              <p className="mt-3 max-w-md text-base text-text-muted">{step.body}</p>
            </Reveal>
            <div className="mt-6 lg:hidden">{step.preview}</div>
          </li>
        ))}
      </ol>

      <div className="relative hidden lg:block">
        <div className="sticky top-24">
          <div className="showcase-stage relative mx-auto min-h-[34rem] max-w-sm">
            {steps.map((step, i) => (
              <div
                key={step.id}
                aria-hidden="true"
                className={`showcase-preview absolute inset-x-0 top-0 flex justify-center ${active === i ? 'is-active' : ''}`}
              >
                {step.preview}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
            {steps.map((step, i) => (
              <span
                key={step.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? 'w-6 bg-accent' : 'w-1.5 bg-border'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
