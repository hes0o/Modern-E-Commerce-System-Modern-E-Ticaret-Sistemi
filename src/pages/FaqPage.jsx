import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { mockFaq } from "../data/mock";

// §4.17 SSS — akordiyon (accordion) görünümlü sıkça sorulan sorular
export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="container-page max-w-2xl py-14">
      <h1 className="mb-8 text-2xl font-semibold">Sıkça Sorulan Sorular</h1>
      <div className="divide-y divide-line rounded-lg border border-line">
        {mockFaq.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
            >
              {item.question}
              <ChevronDown
                size={16}
                className={`text-ink-faint transition-transform ${openIndex === i ? "rotate-180" : ""}`}
              />
            </button>
            {openIndex === i && (
              <p className="px-5 pb-4 text-sm text-ink-soft">{item.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
