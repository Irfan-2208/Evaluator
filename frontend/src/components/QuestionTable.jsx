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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Extracted Questions</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and adjust extracted questions and mark weights before confirming.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
            Total Questions: {questions.length} | Total Marks: {Math.round(totalMarks * 10) / 10}
          </span>

          <button
            type="button"
            onClick={onAddQuestion}
            className="inline-flex items-center text-xs px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
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
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-16">#</th>
              <th className="py-3 px-4">Question Text</th>
              <th className="py-3 px-4 w-28">Type</th>
              <th className="py-3 px-4 w-24">Max Marks</th>
              <th className="py-3 px-4 w-28">Status</th>
              <th className="py-3 px-4 w-16 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {questions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                  No questions yet. Upload a Question Paper PDF above to extract questions.
                </td>
              </tr>
            ) : (
              questions.map((q, idx) => (
                <tr key={q.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  {/* Question No */}
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <input
                      type="text"
                      value={q.question_no || ''}
                      onChange={(e) => handleFieldChange(q, 'question_no', e.target.value)}
                      className="w-12 px-1.5 py-1 border border-slate-300 rounded font-semibold text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>

                  {/* Question Text */}
                  <td className="py-3 px-4">
                    <textarea
                      rows={2}
                      value={q.question_text || ''}
                      onChange={(e) => handleFieldChange(q, 'question_text', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal"
                    />
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4">
                    <select
                      value={q.question_type || 'short'}
                      onChange={(e) => handleFieldChange(q, 'question_type', e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none bg-white"
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="short">Short</option>
                      <option value="long">Long</option>
                      <option value="numerical">Numerical</option>
                    </select>
                  </td>

                  {/* Max Marks */}
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={q.max_marks || 1}
                      onChange={(e) =>
                        handleFieldChange(q, 'max_marks', parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {q.teacher_confirmed ? (
                      <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        AI Draft
                      </span>
                    )}
                  </td>

                  {/* Delete */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title="Delete Question"
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
