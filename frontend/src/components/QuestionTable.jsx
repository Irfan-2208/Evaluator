import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

export default function QuestionTable({
  questions = [],
  onUpdateQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onConfirmAll,
  isConfirmed = false,
}) {
  const handleFieldChange = (q, field, value) => {
    onUpdateQuestion(q.id, { ...q, [field]: value });
  };

  const totalMarks = questions.reduce((acc, q) => acc + (parseFloat(q.max_marks) || 0), 0);

  return (
    <div className="bg-white dark:bg-[#252525] rounded-2xl border-2 border-[#DDD0C8] dark:border-[#4A3830] shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#DDD0C8] dark:border-[#4A3830] flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#faf6f0] via-[#f7f1e8] to-[#faf6f0] dark:from-[#2e2018] dark:via-[#261b14] dark:to-[#2e2018]">
        <div>
          <h3 className="text-sm font-bold text-[#323232] dark:text-[#DDD0C8]">Extracted Questions</h3>
          <p className="text-xs text-[#6b5248] dark:text-[#cbb89f] mt-0.5">
            Review and adjust extracted questions and mark weights before confirming.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-black px-3 py-1.5 bg-[#DDD0C8]/60 dark:bg-[#3d2f2a] text-[#323232] dark:text-[#DDD0C8] rounded-xl border border-[#DDD0C8] dark:border-[#5c4a40] shadow-2xs">
            Total Questions: {questions.length} | Total Marks: {Math.round(totalMarks * 10) / 10}
          </span>

          <button
            type="button"
            onClick={onAddQuestion}
            className="inline-flex items-center text-xs px-3.5 py-1.5 bg-white dark:bg-[#3d2f2a] border border-[#DDD0C8] dark:border-[#5c4a40] text-[#323232] dark:text-[#DDD0C8] hover:bg-[#faf8f6] dark:hover:bg-[#4A3830] rounded-xl font-bold transition-all active:scale-95 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-[#6b5248] dark:text-[#cbb89f]" />
            Add Question
          </button>

          <button
            type="button"
            onClick={onConfirmAll}
            className="inline-flex items-center text-xs px-4 py-1.5 bg-[#323232] hover:bg-[#1a1a1a] dark:bg-[#DDD0C8] dark:hover:bg-[#cbb89f] text-white dark:text-[#323232] rounded-xl font-black shadow-md transition-all active:scale-95"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400 dark:text-emerald-700" />
            Confirm Questions
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f5eee6] dark:bg-[#2e2018] border-b border-[#DDD0C8] dark:border-[#4A3830] text-[#323232] dark:text-[#DDD0C8] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-16">Q#</th>
              <th className="py-3 px-4">Question Text</th>
              <th className="py-3 px-4 w-32">Type</th>
              <th className="py-3 px-4 w-28 text-center">Max Marks</th>
              <th className="py-3 px-4 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD0C8]/60 dark:divide-[#4A3830]/70">
            {questions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-[#8c7268] dark:text-[#cbb89f]/70 bg-[#faf8f6] dark:bg-[#231a17]">
                  No questions extracted yet. Upload question paper or add questions manually.
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id} className="hover:bg-[#faf6f0] dark:hover:bg-[#2e2018]/50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#323232] dark:text-[#DDD0C8]">
                    <input
                      type="text"
                      value={q.question_no || ''}
                      onChange={(e) => handleFieldChange(q, 'question_no', e.target.value)}
                      className="w-12 px-1.5 py-1 border border-[#DDD0C8]/70 dark:border-[#5c4a40] focus:border-[#323232] dark:focus:border-[#DDD0C8] rounded-lg bg-white dark:bg-[#1e1510] text-[#323232] dark:text-[#DDD0C8] text-center font-bold shadow-2xs focus:outline-none"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <textarea
                      rows={2}
                      value={q.question_text || ''}
                      onChange={(e) => handleFieldChange(q, 'question_text', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-[#DDD0C8]/70 dark:border-[#5c4a40] focus:border-[#323232] dark:focus:border-[#DDD0C8] rounded-xl bg-white dark:bg-[#1e1510] text-[#323232] dark:text-[#ede4da] resize-y shadow-2xs focus:outline-none leading-relaxed"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <select
                      value={q.question_type || 'short'}
                      onChange={(e) => handleFieldChange(q, 'question_type', e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-[#DDD0C8] dark:border-[#5c4a40] rounded-xl bg-white dark:bg-[#1e1510] text-[#323232] dark:text-[#DDD0C8] focus:outline-none focus:border-[#323232] dark:focus:border-[#DDD0C8] shadow-2xs font-medium"
                    >
                      <option value="short">Short Answer</option>
                      <option value="long">Long Answer</option>
                      <option value="mcq">MCQ</option>
                      <option value="numerical">Numerical</option>
                    </select>
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={q.max_marks ?? 1.0}
                      onChange={(e) =>
                        handleFieldChange(q, 'max_marks', parseFloat(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1.5 text-center font-black text-[#323232] dark:text-[#DDD0C8] border border-[#DDD0C8] dark:border-[#5c4a40] rounded-xl bg-white dark:bg-[#1e1510] focus:outline-none focus:border-[#323232] dark:focus:border-[#DDD0C8] shadow-2xs"
                    />
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-1.5 text-[#8c7268] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
