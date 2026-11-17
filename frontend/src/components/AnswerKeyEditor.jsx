import React from 'react';
import { CheckCircle, Sparkles, Plus, Trash2 } from 'lucide-react';

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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Answer Key & Marking Scheme</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Model answers and mandatory key points used to grade student papers.
          </p>
        </div>

        <button
          type="button"
          onClick={onConfirmAll}
          className="inline-flex items-center text-xs px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-2xs transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
          Confirm Answer Key
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {answerKeys.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 italic text-xs">
            No answer key generated yet. Upload an Answer Key document or click "Generate with AI" above.
          </div>
        ) : (
          answerKeys.map((ak, idx) => (
            <div key={ak.id || idx} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    Question {ak.question_no || `#${idx + 1}`}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {ak.question_text ? ak.question_text.slice(0, 80) + '...' : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model Answer */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ideal / Model Answer:
                  </label>
                  <textarea
                    rows={3}
                    value={ak.model_answer || ''}
                    onChange={(e) => handleFieldChange(ak, 'model_answer', e.target.value)}
                    placeholder="Enter complete model answer..."
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Key Points (One per line) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Key Points (1 per line for rubric matching):
                  </label>
                  <textarea
                    rows={3}
                    value={(ak.key_points || []).join('\n')}
                    onChange={(e) => handleKeyPointsChange(ak, e.target.value)}
                    placeholder="Point 1&#10;Point 2&#10;Point 3"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Marking Scheme */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Marking Scheme / Step Guidelines:
                </label>
                <input
                  type="text"
                  value={ak.marking_scheme || ''}
                  onChange={(e) => handleFieldChange(ak, 'marking_scheme', e.target.value)}
                  placeholder="e.g. 1 mark for formula, 1 mark for substitution, 1 mark for final result with units"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
