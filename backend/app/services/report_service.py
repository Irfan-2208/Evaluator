"""Report service – PDF and CSV generation with ReportLab, rank calculation, and metrics."""
import io
import csv
import ast
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)

from app.models.student_submission import StudentSubmission
from app.models.question_evaluation import QuestionEvaluation
from app.models.question import Question
from app.models.exam import Exam
from app.models.audit_log import AuditLog
from app.utils.grade_utils import recompute_total, compute_percentage, compute_grade


def compute_student_rank(db: Session, submission: StudentSubmission) -> int:
    """Calculate 1-based rank of student among all submissions for this exam."""
    all_subs = db.query(StudentSubmission).filter(
        StudentSubmission.exam_id == submission.exam_id,
        StudentSubmission.submission_status.in_(["evaluated", "reviewed", "finalized"])
    ).all()

    scores = []
    for s in all_subs:
        evals = db.query(QuestionEvaluation).filter(QuestionEvaluation.submission_id == s.id).all()
        tot = recompute_total(evals)
        scores.append((s.id, tot))

    # Sort descending by score
    scores.sort(key=lambda x: x[1], reverse=True)
    for rank, (s_id, _) in enumerate(scores, start=1):
        if s_id == submission.id:
            return rank
    return 1


def get_report_data(db: Session, submission_id: int) -> Dict[str, Any]:
    """Assemble all structured data needed for the student report."""
    sub = db.query(StudentSubmission).filter(StudentSubmission.id == submission_id).first()
    if not sub:
        raise ValueError(f"Submission {submission_id} not found")

    exam = db.query(Exam).filter(Exam.id == sub.exam_id).first()
    questions = db.query(Question).filter(Question.exam_id == exam.id).order_by(Question.order_index).all()
    evals = db.query(QuestionEvaluation).filter(QuestionEvaluation.submission_id == sub.id).all()
    eval_map = {e.question_id: e for e in evals}

    total_awarded = recompute_total(evals)
    max_total = sum(q.max_marks for q in questions) if questions else (exam.total_marks or 0.0)
    pct = compute_percentage(total_awarded, max_total)
    grade = compute_grade(pct)
    rank = compute_student_rank(db, sub)

    # Get latest remarks from audit log if generated
    remarks_log = db.query(AuditLog).filter(
        AuditLog.submission_id == sub.id,
        AuditLog.action == "remarks_generated"
    ).order_by(AuditLog.timestamp.desc()).first()

    strengths = []
    weak_areas = []
    overall_remark = "Good attempt. Continue practicing core problem areas."
    improvement_suggestions = []

    if remarks_log and remarks_log.new_value:
        try:
            parsed_remarks = ast.literal_eval(remarks_log.new_value)
            if isinstance(parsed_remarks, dict):
                strengths = parsed_remarks.get("strengths", [])
                weak_areas = parsed_remarks.get("weak_areas", [])
                overall_remark = parsed_remarks.get("overall_remark", overall_remark)
                improvement_suggestions = parsed_remarks.get("improvement_suggestions", [])
        except Exception:
            pass

    q_breakdown = []
    for q in questions:
        e = eval_map.get(q.id)
        q_breakdown.append({
            "question_no": q.question_no,
            "question_text": q.question_text,
            "max_marks": q.max_marks,
            "ai_marks": e.ai_marks if e else 0.0,
            "final_marks": e.final_marks if e else 0.0,
            "is_overridden": e.is_overridden if e else False,
            "teacher_comment": e.teacher_comment if e else "",
            "transcribed_answer": e.transcribed_answer if e else "N/A",
            "feedback": e.feedback if e else "",
            "key_points_matched": e.key_points_matched if e else [],
            "key_points_missed": e.key_points_missed if e else [],
        })

    return {
        "student": {
            "name": sub.student_name or sub.ai_detected_name or "Unknown Student",
            "roll_number": sub.roll_number or sub.ai_detected_roll or "N/A",
            "class_name": sub.class_name or exam.class_name or "N/A",
            "status": sub.submission_status,
        },
        "exam": {
            "id": exam.id,
            "title": exam.title,
            "subject": exam.subject,
            "class_name": exam.class_name,
            "total_marks": max_total,
        },
        "performance": {
            "total_marks": total_awarded,
            "max_marks": max_total,
            "percentage": pct,
            "grade": grade,
            "rank": rank,
        },
        "questions": q_breakdown,
        "strengths": strengths,
        "weak_areas": weak_areas,
        "overall_remark": overall_remark,
        "improvement_suggestions": improvement_suggestions,
    }


def generate_submission_pdf(db: Session, submission_id: int) -> bytes:
    """Generate colourful, branded PDF student evaluation report using ReportLab."""
    from reportlab.platypus import FrameBreak
    from reportlab.lib.units import mm

    data = get_report_data(db, submission_id)
    buffer = io.BytesIO()

    # ── Palette ──────────────────────────────────────────────────────────────
    CHARCOAL   = colors.HexColor("#323232")
    BEIGE      = colors.HexColor("#DDD0C8")
    BEIGE_LIGHT= colors.HexColor("#f5ede6")
    BEIGE_MID  = colors.HexColor("#e8d9cc")
    BROWN_DARK = colors.HexColor("#4A3830")
    BROWN_MED  = colors.HexColor("#6b5248")
    AMBER      = colors.HexColor("#d97706")
    AMBER_LIGHT= colors.HexColor("#fef3c7")
    AMBER_MED  = colors.HexColor("#fde68a")
    EMERALD    = colors.HexColor("#059669")
    EMERALD_LIGHT = colors.HexColor("#d1fae5")
    ROSE       = colors.HexColor("#e11d48")
    ROSE_LIGHT = colors.HexColor("#ffe4e6")
    INDIGO     = colors.HexColor("#4f46e5")
    INDIGO_LIGHT = colors.HexColor("#e0e7ff")
    WHITE      = colors.white
    SLATE      = colors.HexColor("#64748b")

    # Grade colours
    grade_colors = {
        "A+": (colors.HexColor("#059669"), colors.HexColor("#d1fae5")),
        "A":  (colors.HexColor("#16a34a"), colors.HexColor("#dcfce7")),
        "B":  (colors.HexColor("#2563eb"), colors.HexColor("#dbeafe")),
        "C":  (colors.HexColor("#d97706"), colors.HexColor("#fef3c7")),
        "D":  (colors.HexColor("#ea580c"), colors.HexColor("#ffedd5")),
        "F":  (colors.HexColor("#dc2626"), colors.HexColor("#fee2e2")),
    }

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    W = letter[0] - 80  # usable width

    styles = getSampleStyleSheet()

    def ps(name, **kw):
        return ParagraphStyle(name, parent=styles["Normal"], **kw)

    # ── Styles ───────────────────────────────────────────────────────────────
    title_st = ps("T", fontSize=22, leading=27, fontName="Helvetica-Bold",
                  textColor=WHITE, spaceAfter=2)
    sub_st   = ps("S", fontSize=9,  leading=13, textColor=colors.HexColor("#DDD0C8"), spaceAfter=0)
    h2_st    = ps("H2", fontSize=11, leading=14, fontName="Helvetica-Bold",
                  textColor=CHARCOAL, spaceBefore=14, spaceAfter=5)
    h2w_st   = ps("H2W", fontSize=11, leading=14, fontName="Helvetica-Bold",
                  textColor=WHITE, spaceBefore=0, spaceAfter=0)
    norm_st  = ps("N", fontSize=8.5, leading=12, textColor=CHARCOAL)
    norm_w   = ps("NW", fontSize=8.5, leading=12, textColor=WHITE)
    bold_st  = ps("B", fontSize=8.5, leading=12, fontName="Helvetica-Bold", textColor=CHARCOAL)
    bold_w   = ps("BW", fontSize=8.5, leading=12, fontName="Helvetica-Bold", textColor=WHITE)
    tiny_st  = ps("TN", fontSize=7.5, leading=11, textColor=SLATE)
    tiny_w   = ps("TNW", fontSize=7.5, leading=11, textColor=BEIGE)
    em_st    = ps("EM", fontSize=8.5, leading=12, textColor=EMERALD, fontName="Helvetica-Bold")
    rose_st  = ps("RS", fontSize=8.5, leading=12, textColor=ROSE, fontName="Helvetica-Bold")
    amber_st = ps("AM", fontSize=8.5, leading=12, textColor=AMBER, fontName="Helvetica-Bold")

    perf    = data["performance"]
    student = data["student"]
    exam    = data["exam"]
    grade   = perf["grade"]
    grade_fg, grade_bg = grade_colors.get(grade, (CHARCOAL, BEIGE_LIGHT))

    elements = []

    # ════════════════════════════════════════════════════════════════════════
    # 1. HEADER BANNER  (dark charcoal background, beige text)
    # ════════════════════════════════════════════════════════════════════════
    banner_data = [[
        Paragraph("🎓  AI Examiner – Performance Report", title_st),
        Paragraph("Official Automated Academic Assessment &amp; Teacher-Verified Evaluation", sub_st),
    ]]
    banner = Table(banner_data, colWidths=[W])
    banner.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), CHARCOAL),
        ("TOPPADDING",    (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 20),
        ("ROUNDEDCORNERS",(0, 0), (-1, -1), [8, 8, 0, 0]),
    ]))
    elements.append(banner)

    # ── Coloured sub-banner with score + grade ───────────────────────────────
    score_text = (
        f"<b>{perf['total_marks']} / {perf['max_marks']}</b>"
        f"  ·  <b>{perf['percentage']}%</b>  ·  Rank #{perf['rank']}"
    )
    sub_banner_data = [[
        Paragraph(score_text, ps("SB", fontSize=13, leading=17, fontName="Helvetica-Bold",
                                 textColor=WHITE)),
        Paragraph(
            f"<b>GRADE  {grade}</b>",
            ps("GB", fontSize=16, leading=20, fontName="Helvetica-Bold",
               textColor=grade_fg, alignment=2)
        ),
    ]]
    sub_banner = Table(sub_banner_data, colWidths=[W * 0.70, W * 0.30])
    sub_banner.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BROWN_DARK),
        ("BACKGROUND",    (1, 0), (1, 0),   grade_bg),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 20),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(sub_banner)
    elements.append(Spacer(1, 14))

    # ════════════════════════════════════════════════════════════════════════
    # 2. STUDENT & EXAM INFO  (2-column coloured grid)
    # ════════════════════════════════════════════════════════════════════════
    CW = W / 4

    def label(txt):
        return Paragraph(txt, ps("LB", fontSize=7, fontName="Helvetica-Bold",
                                  textColor=BROWN_MED, spaceAfter=1))
    def val(txt):
        return Paragraph(str(txt), ps("VL", fontSize=9, fontName="Helvetica-Bold",
                                       textColor=CHARCOAL))

    info_data = [
        [label("STUDENT NAME"), label("ROLL / ID"), label("CLASS / SECTION"), label("SUBJECT")],
        [val(student["name"]), val(student["roll_number"]), val(student["class_name"]),
         val(exam["subject"] or exam["title"] or "N/A")],
    ]
    info_tbl = Table(info_data, colWidths=[CW] * 4)
    info_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BEIGE_LIGHT),
        ("BACKGROUND",    (0, 0), (-1, 0),  BEIGE_MID),
        ("BOX",           (0, 0), (-1, -1), 1.2, BEIGE),
        ("INNERGRID",     (0, 0), (-1, -1), 0.5, BEIGE),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(info_tbl)
    elements.append(Spacer(1, 16))

    # ════════════════════════════════════════════════════════════════════════
    # 3. QUESTION-WISE EVALUATION TABLE
    # ════════════════════════════════════════════════════════════════════════
    # Section header pill
    sec_hdr = Table([[Paragraph("📋  Question-Wise Evaluation Breakdown", h2w_st)]],
                    colWidths=[W])
    sec_hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BROWN_DARK),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ("ROUNDEDCORNERS",(0, 0), (-1, -1), [6, 6, 0, 0]),
    ]))
    elements.append(sec_hdr)

    q_header = [
        Paragraph("<b>Q#</b>", bold_st),
        Paragraph("<b>Question Text</b>", bold_st),
        Paragraph("<b>Max</b>", bold_st),
        Paragraph("<b>AI</b>", bold_st),
        Paragraph("<b>Final</b>", bold_st),
        Paragraph("<b>AI Feedback</b>", bold_st),
    ]

    q_rows = [q_header]
    for q in data["questions"]:
        override_note = Paragraph(
            "<font color='#d97706'><b>(Teacher Adj.)</b></font>", norm_st
        ) if q["is_overridden"] else Paragraph("", norm_st)

        final_cell = [
            Paragraph(f"<b>{q['final_marks']}</b>", bold_st),
            override_note,
        ]

        q_rows.append([
            Paragraph(f"<b>{q['question_no']}</b>", bold_st),
            Paragraph(q["question_text"][:90] + ("…" if len(q["question_text"]) > 90 else ""), norm_st),
            Paragraph(str(q["max_marks"]), norm_st),
            Paragraph(str(q["ai_marks"]), norm_st),
            final_cell,
            Paragraph(q["feedback"][:130] + ("…" if len(q["feedback"]) > 130 else ""), tiny_st),
        ])

    q_tbl = Table(q_rows, colWidths=[28, 155, 28, 32, 55, W - 28 - 155 - 28 - 32 - 55])
    q_style = [
        ("BACKGROUND",    (0, 0), (-1, 0),  BEIGE),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  CHARCOAL),
        ("GRID",          (0, 0), (-1, -1), 0.5, BEIGE),
        ("BOX",           (0, 0), (-1, -1), 1,   BEIGE),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [WHITE, BEIGE_LIGHT]),
    ]
    # Highlight teacher-overridden rows amber
    for r_idx, q in enumerate(data["questions"], start=1):
        if q["is_overridden"]:
            q_style.append(("BACKGROUND", (0, r_idx), (-1, r_idx), AMBER_LIGHT))

    q_tbl.setStyle(TableStyle(q_style))
    elements.append(q_tbl)
    elements.append(Spacer(1, 16))

    # ════════════════════════════════════════════════════════════════════════
    # 4. STRENGTHS / WEAK AREAS  (side-by-side coloured panels)
    # ════════════════════════════════════════════════════════════════════════
    half = (W - 10) / 2

    def build_panel(title, items, bg, border, title_color, bullet_color):
        rows = [[Paragraph(title, ps("PH", fontSize=9, fontName="Helvetica-Bold",
                                      textColor=title_color))]]
        for item in items:
            rows.append([Paragraph(f"• {item}",
                                   ps("PI", fontSize=8, leading=11, textColor=CHARCOAL))])
        tbl = Table(rows, colWidths=[half])
        tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0),  bg),
            ("BACKGROUND",    (0, 1), (-1, -1), colors.HexColor("#ffffff")),
            ("BOX",           (0, 0), (-1, -1), 1.2, border),
            ("LEFTPADDING",   (0, 0), (-1, -1), 10),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
            ("TOPPADDING",    (0, 0), (-1, 0),  7),
            ("BOTTOMPADDING", (0, 0), (-1, 0),  7),
            ("TOPPADDING",    (0, 1), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
        ]))
        return tbl

    has_strengths = bool(data["strengths"])
    has_weaknesses = bool(data["weak_areas"])

    if has_strengths or has_weaknesses:
        sec_hdr2 = Table([[Paragraph("💡  Performance Analysis", h2w_st)]], colWidths=[W])
        sec_hdr2.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), EMERALD),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING",   (0, 0), (-1, -1), 14),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ]))
        elements.append(sec_hdr2)

        s_panel = build_panel(
            "✅  Key Strengths & Mastery",
            data["strengths"] or ["–"],
            EMERALD_LIGHT, colors.HexColor("#6ee7b7"), EMERALD, EMERALD,
        )
        w_panel = build_panel(
            "⚠️  Areas for Improvement",
            data["weak_areas"] or ["–"],
            ROSE_LIGHT, colors.HexColor("#fca5a5"), ROSE, ROSE,
        )
        panels_row = [[s_panel, Spacer(10, 1), w_panel]]
        panels_tbl = Table(panels_row, colWidths=[half, 10, half])
        panels_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",    (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING",   (0, 0), (-1, -1), 0),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
        ]))
        elements.append(panels_tbl)
        elements.append(Spacer(1, 14))

    # ════════════════════════════════════════════════════════════════════════
    # 5. OVERALL REMARK  (amber accent panel)
    # ════════════════════════════════════════════════════════════════════════
    sec_hdr3 = Table([[Paragraph("✨  Teacher & AI Overall Remark", h2w_st)]], colWidths=[W])
    sec_hdr3.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMBER),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
    ]))
    elements.append(sec_hdr3)

    remark_tbl = Table(
        [[Paragraph(data["overall_remark"],
                    ps("RK", fontSize=9, leading=14, textColor=CHARCOAL))]],
        colWidths=[W]
    )
    remark_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMBER_LIGHT),
        ("BOX",           (0, 0), (-1, -1), 1, AMBER_MED),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
    ]))
    elements.append(remark_tbl)
    elements.append(Spacer(1, 14))

    # ════════════════════════════════════════════════════════════════════════
    # 6. STUDY RECOMMENDATIONS  (indigo panel)
    # ════════════════════════════════════════════════════════════════════════
    if data["improvement_suggestions"]:
        sec_hdr4 = Table([[Paragraph("📚  Actionable Study Recommendations", h2w_st)]], colWidths=[W])
        sec_hdr4.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), INDIGO),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING",   (0, 0), (-1, -1), 14),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ]))
        elements.append(sec_hdr4)

        sugg_rows = []
        for s in data["improvement_suggestions"]:
            sugg_rows.append([Paragraph(f"→  {s}",
                                        ps("SG", fontSize=8.5, leading=12, textColor=CHARCOAL))])
        sugg_tbl = Table(sugg_rows, colWidths=[W])
        sugg_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), INDIGO_LIGHT),
            ("BOX",           (0, 0), (-1, -1), 1, colors.HexColor("#a5b4fc")),
            ("ROWBACKGROUNDS",(0, 0), (-1, -1), [INDIGO_LIGHT, WHITE]),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 14),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ]))
        elements.append(sugg_tbl)
        elements.append(Spacer(1, 14))

    # ════════════════════════════════════════════════════════════════════════
    # 7. FOOTER
    # ════════════════════════════════════════════════════════════════════════
    footer_data = [[
        Paragraph("Generated by  <b>AI Examiner</b>  –  Automated Evaluation with Teacher Review",
                  ps("FT", fontSize=7.5, textColor=WHITE)),
        Paragraph("Verified &amp; Approved by Teacher",
                  ps("FT2", fontSize=7.5, textColor=BEIGE, alignment=2)),
    ]]
    footer_tbl = Table(footer_data, colWidths=[W * 0.6, W * 0.4])
    footer_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), CHARCOAL),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(footer_tbl)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


def generate_submission_csv(db: Session, submission_id: int) -> str:
    """Generate CSV report for one submission."""
    data = get_report_data(db, submission_id)
    output = io.StringIO()
    writer = csv.writer(output)

    # Header info
    writer.writerow(["AI EXAMINER - STUDENT PERFORMANCE REPORT"])
    writer.writerow(["Student Name", data["student"]["name"]])
    writer.writerow(["Roll Number", data["student"]["roll_number"]])
    writer.writerow(["Class", data["student"]["class_name"]])
    writer.writerow(["Exam Title", data["exam"]["title"]])
    writer.writerow(["Subject", data["exam"]["subject"]])
    writer.writerow(["Total Score", data["performance"]["total_marks"]])
    writer.writerow(["Max Marks", data["performance"]["max_marks"]])
    writer.writerow(["Percentage", f"{data['performance']['percentage']}%"])
    writer.writerow(["Grade", data["performance"]["grade"]])
    writer.writerow(["Rank", f"#{data['performance']['rank']}"])
    writer.writerow([])

    # Question table
    writer.writerow(["Question No", "Max Marks", "AI Marks", "Final Marks", "Teacher Overridden", "Feedback", "Transcribed Answer"])
    for q in data["questions"]:
        writer.writerow([
            q["question_no"],
            q["max_marks"],
            q["ai_marks"],
            q["final_marks"],
            "Yes" if q["is_overridden"] else "No",
            q["feedback"],
            q["transcribed_answer"],
        ])

    return output.getvalue()


def generate_exam_csv(db: Session, exam_id: int) -> str:
    """Generate summary CSV of all students in an exam with question-wise marks."""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise ValueError(f"Exam {exam_id} not found")

    questions = db.query(Question).filter(Question.exam_id == exam_id).order_by(Question.order_index).all()
    submissions = db.query(StudentSubmission).filter(StudentSubmission.exam_id == exam_id).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Columns: Student Name, Roll No, Class, Status, Q1, Q2, ..., Total, Max Marks, %, Grade
    q_cols = [f"Q{q.question_no} (/{q.max_marks})" for q in questions]
    header = ["Student Name", "Roll Number", "Class", "Status"] + q_cols + ["Total Marks", "Max Marks", "Percentage", "Grade"]
    writer.writerow(header)

    max_exam_marks = sum(q.max_marks for q in questions) if questions else (exam.total_marks or 0.0)

    for sub in submissions:
        evals = db.query(QuestionEvaluation).filter(QuestionEvaluation.submission_id == sub.id).all()
        eval_map = {e.question_id: e for e in evals}
        tot = recompute_total(evals)
        pct = compute_percentage(tot, max_exam_marks)
        grade = compute_grade(pct)

        row = [
            sub.student_name or sub.ai_detected_name or "Unknown",
            sub.roll_number or sub.ai_detected_roll or "N/A",
            sub.class_name or exam.class_name or "N/A",
            sub.submission_status,
        ]

        for q in questions:
            ev = eval_map.get(q.id)
            row.append(ev.final_marks if ev is not None else 0.0)

        row.extend([tot, max_exam_marks, f"{pct}%", grade])
        writer.writerow(row)

    return output.getvalue()
