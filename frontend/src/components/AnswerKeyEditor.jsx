import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function AnswerKeyEditor({
  answerKeys = [],
  onUpdateKey,
  onConfirmAll,
}) {
  const handleFieldChange = (ak, field, value) => {
    onUpdateKey(ak.id, { ...ak, [field]: value });
  };

  const handleKeyPointsChange = (ak, text) => {
    const points = text.split('\n').filter((p) => p.trim().length > 0);
    onUpdateKey(ak.id, { ...ak, key_points: points });
  };

  return (
    <div className="bg-white dark:bg-[#252525] rounded-2xl border-2 border-[#DDD0C8] dark:border-[#4A3830] shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-[#DDD0C8] dark:border-[#4A3830] flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#faf6f0] via-[#f7f1e8] to-[#faf6f0] dark:from-[#2e2018] dark:via-[#261b14] dark:to-[#2e2018]">
        <div>
          <h3 className="text-sm font-bold text-[#323232] dark:text-[#DDD0C8]">Answer Key & Marking Scheme</h3>
          <p className="text-xs text-[#6b5248] dark:text-[#cbb89f] mt-0.5">
            Model answers and mandatory key points used to grade student papers.
          </p>
        </div>

        <button
          type="button"
          onClick={onConfirmAll}
          className="inline-flex items-center text-xs px-4 py-1.5 bg-[#323232] hover:bg-[#1a1a1a] dark:bg-[#DDD0C8] dark:hover:bg-[#cbb89f] text-white dark:text-[#323232] rounded-xl font-black shadow-md transition-all active:scale-95"
        >
          <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400 dark:text-emerald-700" />
          Confirm Answer Key
        </button>
      </div>

      <div className="divide-y divide-[#DDD0C8]/60 dark:divide-[#4A3830]/70">
        {answerKeys.length === 0 ? (
          <div className="text-center py-10 text-[#8c7268] dark:text-[#cbb89f]/70 bg-[#faf8f6] dark:bg-[#231a17] italic text-xs">
            No answer key generated yet. Upload an Answer Key document or click "Generate with AI" above.
          </div>
        ) : (
          answerKeys.map((ak, idx) => (
            <div key={ak.id || idx} className="p-4 hover:bg-[#faf6f0] dark:hover:bg-[#2e2018]/40 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs bg-[#DDD0C8]/60 dark:bg-[#3d2f2a] px-3 py-1 rounded-xl text-[#323232] dark:text-[#DDD0C8] border border-[#DDD0C8] dark:border-[#5c4a40]">
                    Question {ak.question_no || `#${idx + 1}`}
                  </span>
                  <span className="text-xs text-[#6b5248] dark:text-[#cbb89f]">
                    {ak.question_text ? ak.question_text.slice(0, 80) + '...' : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model Answer */}
                <div>
                  <label className="block text-xs font-semibold text-[#323232] dark:text-[#DDD0C8] mb-1">
                    Ideal / Model Answer:
                  </label>
                  <textarea
                    rows={3}
                    value={ak.model_answer || ''}
                    onChange={(e) => handleFieldChange(ak, 'model_answer', e.target.value)}
                    placeholder="Enter complete model answer..."
                    className="w-full text-xs p-2.5 border border-[#DDD0C8] dark:border-[#5c4a40] rounded-xl bg-white dark:bg-[#1e1510] text-[#323232] dark:text-[#ede4da] focus:outline-none focus:border-[#323232] dark:focus:border-[#DDD0C8] shadow-2xs leading-relaxed"
                  />
                </div>

                {/* Key Points (One per line) */}
                <div>
                  <label className="block text-xs font-semibold text-[#323232] dark:text-[#DDD0C8] mb-1">
                    Key Points (1 per line for rubric matching):
                  </label>
                  <textarea
                    rows={3}
                    value={(ak.key_points || []).join('\n')}
                    onChange={(e) => handleKeyPointsChange(ak, e.target.value)}
                    placeholder="Point 1&#10;Point 2&#10;Point 3"
                    className="w-full text-xs p-2.5 border border-[#DDD0C8] dark:border-[#5c4a40] rounded-xl bg-white dark:bg-[#1e1510] text-[#323232] dark:text-[#ede4da] focus:outline-none focus:border-[#323232] dark:focus:border-[#DDD0C8] font-mono shadow-2xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Marking Scheme */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6b5248] dark:text-[#cbb89f] mb-1">
                  Marking Scheme / Step Guidelines:
                </label>
                <input
                  type="text"
                  value={ak.marking_scheme || ''}
                  onChange={(e) => handleFieldChange(ak, 'marking_scheme', e.target.value)}
                  placeholder="e.g. 1 mark for formula, 1 mark for substitution, 1 mark for final result with units"
                  className="w-full text-xs px-3 py-2 border border-[#DDD0C8] dark:border-[#5c4a40] rounded-xl bg-white dark:bg-[#1e1510] text-[#323232] dark:text-[#ede4da] focus:outline-none focus:border-[#323232] dark:focus:border-[#DDD0C8] shadow-2xs"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
