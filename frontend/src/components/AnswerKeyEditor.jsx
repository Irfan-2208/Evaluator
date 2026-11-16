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
    // Split by newlines or commas
    const points = text.split('\n').filter((p) => p.trim().length > 0);
    onUpdateKey(ak.id, { ...ak, key_points: points });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Answer Key & Marking Scheme</h3>
          <p className="text-xs text-slate-500 mt-0.5">
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

      <div className="divide-y divide-slate-100">
        {answerKeys.length === 0 ? (
          <div className="text-center py-10 text-slate-400 italic text-xs">
            No answer key generated yet. Upload an Answer Key document or click "Generate with AI" above.
          </div>
        ) : (
          answerKeys.map((ak, idx) => (
            <div key={ak.id || idx} className="p-4 hover:bg-slate-50/50 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-800 border border-slate-200">
                    Question {ak.question_no || `#${idx + 1}`}
                  </span>

                  {ak.is_ai_generated && (
                    <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5 mr-1 text-amber-600" />
                      AI-Generated Key
                    </span>
                  )}

                  {ak.teacher_confirmed ? (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Confirmed
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Model Answer Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ideal Model Answer:
                </label>
                <textarea
                  rows={2}
                  value={ak.model_answer || ''}
                  onChange={(e) => handleFieldChange(ak, 'model_answer', e.target.value)}
                  placeholder="Enter ideal answer..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal font-sans"
                />
              </div>

              {/* Key Points & Marking Scheme side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Points (one per line):
                  </label>
                  <textarea
                    rows={2}
                    value={(ak.key_points || []).join('\n')}
                    onChange={(e) => handleKeyPointsChange(ak, e.target.value)}
                    placeholder="Formula applied&#10;Correct final calculation"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Marking Scheme / Split:
                  </label>
                  <textarea
                    rows={2}
                    value={ak.marking_scheme || ''}
                    onChange={(e) => handleFieldChange(ak, 'marking_scheme', e.target.value)}
                    placeholder="1 mark for method, 1 mark for answer"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
