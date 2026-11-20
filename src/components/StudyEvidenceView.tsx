import React from 'react';
import { ExternalLink } from 'lucide-react';
import { STUDY_EVIDENCE_SECTIONS, VERIFIED_SOURCES } from '../data/tourAndQuiz';

export const StudyEvidenceView: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-[#DCE1D9] pb-4">
        <p className="text-xs font-medium text-[#52606D]">
          Empirical Context &amp; Citations · Shoush &amp; Dumas (2023/2024)
        </p>
        <h2 className="font-display text-2xl font-bold text-[#24313A] mt-1">
          What the Study Evaluated
        </h2>
        <p className="text-sm text-[#475569] mt-1 leading-relaxed">
          All interactive demonstrations in this Observatory use synthetic teaching data. Below is a verified summary of what Shoush and Dumas’ research evaluated, presented strictly under the study’s assumptions without invented metrics.
        </p>
      </div>

      {STUDY_EVIDENCE_SECTIONS.map((sec) => (
        <section
          key={sec.title}
          className="bg-white border border-[#DCE1D9] rounded-xl p-5 space-y-4"
        >
          <div>
            <h3 className="font-display text-lg font-bold text-[#24313A]">{sec.title}</h3>
            <p className="text-sm text-[#475569] mt-1 leading-relaxed">{sec.summary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sec.items.map((item) => (
              <div
                key={item.name}
                className="bg-[#FAFBF9] border border-[#E2E5DE] rounded-lg p-4 space-y-1.5"
              >
                <h4 className="font-display text-sm font-bold text-[#24313A]">
                  {item.name}
                </h4>
                <p className="text-xs text-[#475569] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Verified Sources */}
      <section className="bg-white border border-[#DCE1D9] rounded-xl p-5 space-y-3">
        <h3 className="font-display text-lg font-bold text-[#24313A]">
          Sources &amp; Verification Scope
        </h3>
        <ul className="divide-y divide-[#E6E9E2]">
          {VERIFIED_SOURCES.map((src) => (
            <li key={src.title} className="py-3 first:pt-0 last:pb-0 space-y-1">
              <div className="text-sm font-semibold text-[#24313A]">
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#1D4ED8] hover:underline"
                  >
                    <span>{src.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <span>{src.title}</span>
                )}
              </div>
              <div className="text-xs text-[#52606D]">
                <span className="font-mono-tabular">{src.citation}</span>
                <span aria-hidden="true"> · </span>
                <span>{src.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};
