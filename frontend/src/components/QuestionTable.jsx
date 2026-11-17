import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Edit3 } from 'lucide-react';

export default function QuestionTable({
  questions = [],
  onUpdateQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onConfirmAll,
  isConfirmed = false,
}) {
  const [editingId, setEditingId] = useState(null);

  const handleFieldChange = (q, field, value) => {
    onUpdateQuestion(q.id, { ...q, [field]: value });
  };

  const totalMarks = questions.reduce((acc, q) => acc + (parseFloat(q.max_marks) || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Extracted Questions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review and adjust extracted questions and mark weights before confirming.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800">
            Total Questions: {questions.length} | Total Marks: {Math.round(totalMarks * 10) / 10}
          </span>

          <button
            type="button"
            onClick={onAddQuestion}
            className="inline-flex items-center text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Question
          </button>

          <button
            type="button"
            onClick={onConfirmAll}
            className="inline-flex items-center text-xs px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-2xs transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Confirm Questions
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-16">Q#</th>
              <th className="py-3 px-4">Question Text</th>
              <th className="py-3 px-4 w-28">Type</th>
              <th className="py-3 px-4 w-28 text-center">Max Marks</th>
              <th className="py-3 px-4 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {questions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400 dark:text-slate-500">
                  No questions extracted yet. Upload question paper or add questions manually.
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                    <input
                      type="text"
                      value={q.question_no || ''}
                      onChange={(e) => handleFieldChange(q, 'question_no', e.target.value)}
                      className="w-10 px-1 py-0.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 rounded bg-transparent focus:bg-white dark:focus:bg-slate-800 dark:text-white text-center font-bold"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <textarea
                      rows={2}
                      value={q.question_text || ''}
                      onChange={(e) => handleFieldChange(q, 'question_text', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 rounded bg-transparent focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 resize-y"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <select
                      value={q.question_type || 'short'}
                      onChange={(e) => handleFieldChange(q, 'question_type', e.target.value)}
                      className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
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
                      className="w-16 px-1.5 py-1 text-center font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
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
