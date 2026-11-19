import api from './api';

export const studentService = {
  async uploadSubmission(examId, file, studentName = '', rollNumber = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (studentName) formData.append('student_name', studentName);
    if (rollNumber) formData.append('roll_number', rollNumber);
    const res = await api.post(`/exams/${examId}/submissions/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // { submission_id, job_id, message }
  },

  async bulkUploadSubmissions(examId, files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    const res = await api.post(`/exams/${examId}/submissions/bulk-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async listSubmissions(examId) {
    const res = await api.get(`/exams/${examId}/submissions`);
    return res.data;
  },

  async getSubmission(submissionId) {
    const res = await api.get(`/submissions/${submissionId}`);
    return res.data;
  },

  async updateHeader(submissionId, data) {
    const res = await api.put(`/submissions/${submissionId}/header`, data);
    return res.data;
  },

  async deleteSubmission(submissionId) {
    await api.delete(`/submissions/${submissionId}`);
  },

  // Evaluations
  async getEvaluations(submissionId) {
    const res = await api.get(`/submissions/${submissionId}/evaluations`);
    return res.data;
  },

  async overrideMarks(evalId, finalMarks, teacherComment = '') {
    const res = await api.put(`/evaluations/${evalId}/marks`, {
      final_marks: finalMarks,
      teacher_comment: teacherComment,
    });
    return res.data;
  },

  async reEvaluateQuestion(evalId) {
    const res = await api.post(`/evaluations/${evalId}/re-evaluate`);
    return res.data;
  },

  async finalizeSubmission(submissionId) {
    const res = await api.post(`/submissions/${submissionId}/finalize`);
    return res.data;
  },

  async getAuditLog(submissionId) {
    const res = await api.get(`/submissions/${submissionId}/audit-log`);
    return res.data;
  },

  // Reports
  async getReport(submissionId) {
    const res = await api.get(`/submissions/${submissionId}/report`);
    return res.data;
  },

  async downloadReportPdf(submissionId, studentName = 'student') {
    const res = await api.get(`/submissions/${submissionId}/report/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (studentName || `student_${submissionId}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `AI_Examiner_Report_${safeName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  getReportPdfUrl(submissionId) {
    const token = localStorage.getItem('token');
    return `/api/submissions/${submissionId}/report/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  getReportCsvUrl(submissionId) {
    return `/api/submissions/${submissionId}/report/csv`;
  },

  getExamCsvUrl(examId) {
    return `/api/exams/${examId}/report/csv`;
  },

  // Jobs
  async getJob(jobId) {
    const res = await api.get(`/jobs/${jobId}`);
    return res.data;
  },
};
