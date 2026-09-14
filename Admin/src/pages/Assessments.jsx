import { useEffect, useMemo, useState } from "react";
import {
  Add,
  CheckCircleOutline,
  DeleteOutline,
  EditOutlined,
  QuizOutlined,
  Refresh,
  Save,
  ToggleOff,
  ToggleOn,
} from "@mui/icons-material";
import {
  createAdminAssessment,
  deleteAdminAssessment,
  getAdminAssessment,
  listAdminAssessments,
  updateAdminAssessment,
} from "../services/assessment.service";
import { listAdminCourses } from "../services/adminCourse.service";
import { getApiErrorMessage } from "../services/api";

const blankQuestion = () => ({
  _id: `new-${Date.now()}-${Math.random()}`,
  question: "",
  marks: 1,
  options: [
    { _id: `new-option-${Date.now()}-1`, text: "" },
    { _id: `new-option-${Date.now()}-2`, text: "" },
  ],
  correctOptionId: "",
});

const emptyForm = (courseId = "") => ({
  course: courseId,
  title: "Course Mini Test",
  description: "",
  passingScore: 60,
  maxAttempts: 3,
  isPublished: false,
  questions: [blankQuestion()],
});

const normalizeQuestion = (question) => ({
  _id: question._id || `new-${Date.now()}-${Math.random()}`,
  question: question.question || "",
  marks: question.marks ?? 1,
  correctOptionId: question.correctOptionId || question.options?.[0]?._id || "",
  options: (question.options || []).map((option) => ({
    _id: option._id || `new-option-${Date.now()}-${Math.random()}`,
    text: option.text || "",
  })),
});

const toForm = (assessment) => ({
  course: assessment?.course?._id || assessment?.course || "",
  title: assessment?.title || "Course Mini Test",
  description: assessment?.description || "",
  passingScore: assessment?.passingScore ?? 60,
  maxAttempts: assessment?.maxAttempts ?? 3,
  isPublished: Boolean(assessment?.isPublished),
  questions: (assessment?.questions || []).map(normalizeQuestion),
});

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [assessmentData, courseData] = await Promise.all([
        listAdminAssessments(),
        listAdminCourses({ page: 1, limit: 100 }),
      ]);
      setAssessments(assessmentData?.assessments || assessmentData || []);
      setCourses(courseData?.courses || courseData || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load assessments."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const existingCourseIds = useMemo(
    () => new Set(assessments.map((item) => String(item.course?._id || item.course || ""))),
    [assessments]
  );

  const resetForm = () => {
    const firstAvailable = courses.find((course) => !existingCourseIds.has(String(course._id || course.id)));
    setEditingId(null);
    setForm(emptyForm(firstAvailable?._id || firstAvailable?.id || ""));
  };

  const startEdit = async (assessment) => {
    try {
      setError("");
      const full = await getAdminAssessment(assessment._id);
      setEditingId(full?._id || assessment._id);
      setForm(toForm(full));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to open assessment."));
    }
  };

  const updateQuestion = (questionIndex, patch) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex ? { ...question, ...patch } : question
      ),
    }));
  };

  const updateOption = (questionIndex, optionIndex, text) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentIndex) =>
                currentIndex === optionIndex ? { ...option, text } : option
              ),
            }
          : question
      ),
    }));
  };

  const addOption = (questionIndex) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex && question.options.length < 6
          ? {
              ...question,
              options: [
                ...question.options,
                { _id: `new-option-${Date.now()}-${Math.random()}`, text: "" },
              ],
            }
          : question
      ),
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex || question.options.length <= 2) return question;
        const removed = question.options[optionIndex];
        const options = question.options.filter((_, currentIndex) => currentIndex !== optionIndex);
        return {
          ...question,
          options,
          correctOptionId:
            question.correctOptionId === removed?._id ? options[0]?._id || "" : question.correctOptionId,
        };
      }),
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({ ...current, questions: [...current.questions, blankQuestion()] }));
  };

  const removeQuestion = (questionIndex) => {
    setForm((current) => ({
      ...current,
      questions:
        current.questions.length > 1
          ? current.questions.filter((_, index) => index !== questionIndex)
          : current.questions,
    }));
  };

  const validate = () => {
    if (!form.course) return "Please select a course.";
    if (!form.title.trim()) return "Assessment title is required.";
    if (!form.questions.length) return "Add at least one question.";
    for (let index = 0; index < form.questions.length; index += 1) {
      const question = form.questions[index];
      if (!question.question.trim()) return `Question ${index + 1} needs text.`;
      if (question.options.length < 2 || question.options.length > 6) return `Question ${index + 1} must have 2 to 6 options.`;
      if (question.options.some((option) => !option.text.trim())) return `Complete all options for question ${index + 1}.`;
      if (!question.correctOptionId) return `Choose a correct answer for question ${index + 1}.`;
    }
    return "";
  };

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = {
        courseId: form.course,
        title: form.title.trim(),
        description: form.description.trim(),
        passingScore: Number(form.passingScore),
        maxAttempts: Number(form.maxAttempts),
        isPublished: Boolean(form.isPublished),
        questions: form.questions.map((question) => ({
          _id: question._id.startsWith("new-") ? undefined : question._id,
          question: question.question.trim(),
          marks: Number(question.marks) || 1,
          correctOptionId: question.correctOptionId,
          options: question.options.map((option) => ({
            _id: option._id.startsWith("new-") ? undefined : option._id,
            text: option.text.trim(),
          })),
        })),
      };
      if (editingId) {
        const updated = await updateAdminAssessment(editingId, payload);
        setNotice("Assessment updated successfully.");
        setForm(toForm(updated));
      } else {
        const created = await createAdminAssessment(payload);
        setNotice("Assessment created successfully.");
        setForm(emptyForm());
      }
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save assessment."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (assessment) => {
    if (!window.confirm("Delete this assessment and its attempt records? This cannot be undone.")) return;
    try {
      setError("");
      await deleteAdminAssessment(assessment._id);
      if (editingId === assessment._id) resetForm();
      setNotice("Assessment deleted successfully.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete assessment."));
    }
  };

  const togglePublish = async (assessment) => {
    try {
      setError("");
      const full = await getAdminAssessment(assessment._id);
      await updateAdminAssessment(assessment._id, { isPublished: !full.isPublished });
      setNotice(full.isPublished ? "Assessment moved to draft." : "Assessment published successfully.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to change publication status."));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-700">
              <QuizOutlined fontSize="small" /> Assessment Center
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Course Assessments</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create secure, server-graded mini tests. A published assessment becomes part of the certificate eligibility flow.</p>
          </div>
          <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700">
            <Add fontSize="small" /> New Assessment
          </button>
        </div>

        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        {notice && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div>}

        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/70 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">{editingId ? "Edit Assessment" : "Create Assessment"}</h2>
                <p className="mt-1 text-sm text-slate-500">One assessment can be configured per course.</p>
              </div>
              <button type="button" onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                <Refresh fontSize="small" /> Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-3">
            <label className="block lg:col-span-1">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Course</span>
              <select value={form.course} onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))} disabled={Boolean(editingId)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none ring-blue-500 focus:ring-2 disabled:bg-slate-100">
                <option value="">Select course</option>
                {courses.map((course) => {
                  const id = course._id || course.id;
                  return <option key={id} value={id}>{course.title}{existingCourseIds.has(String(id)) && String(id) !== String(form.course) ? " — assessment exists" : ""}</option>;
                })}
              </select>
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Assessment Title</span>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none ring-blue-500 focus:ring-2" placeholder="Course Mini Test" />
            </label>
            <label className="block lg:col-span-3">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Description</span>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none ring-blue-500 focus:ring-2" placeholder="Short instructions for students..." />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Passing Score (%)</span>
              <input type="number" min="1" max="100" value={form.passingScore} onChange={(event) => setForm((current) => ({ ...current, passingScore: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none ring-blue-500 focus:ring-2" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Maximum Attempts</span>
              <input type="number" min="1" max="20" value={form.maxAttempts} onChange={(event) => setForm((current) => ({ ...current, maxAttempts: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none ring-blue-500 focus:ring-2" />
            </label>
            <label className="flex items-end">
              <span className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span><span className="block text-sm font-extrabold text-slate-800">Published</span><span className="text-xs text-slate-500">Students can attempt it</span></span>
                <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))} className="h-5 w-5 accent-blue-600" />
              </span>
            </label>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="text-lg font-black text-slate-950">Questions</h3><p className="text-sm text-slate-500">2–6 options per question. Select exactly one correct answer.</p></div>
              <button type="button" onClick={addQuestion} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-extrabold text-blue-700 hover:bg-blue-50"><Add fontSize="small" /> Add Question</button>
            </div>

            <div className="space-y-5">
              {form.questions.map((question, questionIndex) => (
                <article key={question._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">{questionIndex + 1}</span><span className="font-black text-slate-900">Question {questionIndex + 1}</span></div>
                    <button type="button" onClick={() => removeQuestion(questionIndex)} disabled={form.questions.length <= 1} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-30"><DeleteOutline fontSize="small" /> Remove</button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[1fr_130px]">
                    <textarea rows={3} value={question.question} onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })} className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none ring-blue-500 focus:ring-2" placeholder="Write the question..." />
                    <label><span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Marks</span><input type="number" min="1" max="100" value={question.marks} onChange={(event) => updateQuestion(questionIndex, { marks: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none ring-blue-500 focus:ring-2" /></label>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {question.options.map((option, optionIndex) => (
                      <div key={option._id} className="flex items-center gap-2">
                        <button type="button" title="Set correct answer" onClick={() => updateQuestion(questionIndex, { correctOptionId: option._id })} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-black transition ${question.correctOptionId === option._id ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-400 hover:border-blue-200"}`}>
                          {question.correctOptionId === option._id ? <CheckCircleOutline fontSize="small" /> : String.fromCharCode(65 + optionIndex)}
                        </button>
                        <input value={option.text} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-500 focus:ring-2" placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} />
                        <button type="button" onClick={() => removeOption(questionIndex, optionIndex)} disabled={question.options.length <= 2} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-25"><DeleteOutline fontSize="small" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(questionIndex)} disabled={question.options.length >= 6} className="mt-1 text-xs font-extrabold text-blue-700 hover:text-blue-900 disabled:opacity-30">+ Add option</button>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-500">Green option marker = correct answer.</p>
                </article>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end sm:p-7">
            <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50">Reset</button>
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"><Save fontSize="small" /> {saving ? "Saving..." : editingId ? "Update Assessment" : "Create Assessment"}</button>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div><h2 className="text-xl font-black text-slate-950">Configured Assessments</h2><p className="mt-1 text-sm text-slate-500">Monitor publication and student attempt performance.</p></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{assessments.length} total</span>
          </div>
          {loading ? <div className="p-10 text-center text-sm font-semibold text-slate-500">Loading assessments...</div> : assessments.length === 0 ? <div className="p-10 text-center"><QuizOutlined className="text-slate-300" sx={{ fontSize: 54 }} /><p className="mt-3 font-black text-slate-800">No assessments configured</p><p className="mt-1 text-sm text-slate-500">Create the first assessment above. Course selection is loaded directly from Course Management.</p></div> : (
            <div className="divide-y divide-slate-100">
              {assessments.map((assessment) => {
                const courseTitle = assessment.course?.title || "Unknown course";
                const stats = assessment.stats || {};
                const attempts = Number(stats.attempts || 0);
                const passed = Number(stats.passed || 0);
                const avg = Number(stats.avgScore || 0);
                return <div key={assessment._id} className="p-5 transition hover:bg-slate-50/70 sm:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-base font-black text-slate-950">{assessment.title}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${assessment.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{assessment.isPublished ? "Published" : "Draft"}</span></div>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{courseTitle} • {assessment.questionCount ?? assessment.questions?.length ?? 0} questions • Pass {assessment.passingScore}% • {assessment.maxAttempts} attempts</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500"><span className="rounded-lg bg-slate-100 px-2.5 py-1.5">Attempts {attempts}</span><span className="rounded-lg bg-slate-100 px-2.5 py-1.5">Passed {passed}</span><span className="rounded-lg bg-slate-100 px-2.5 py-1.5">Avg {avg.toFixed(1)}%</span></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => togglePublish(assessment)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50">{assessment.isPublished ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}{assessment.isPublished ? "Unpublish" : "Publish"}</button>
                      <button type="button" onClick={() => startEdit(assessment)} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100"><EditOutlined fontSize="small" /> Edit</button>
                      <button type="button" onClick={() => remove(assessment)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100"><DeleteOutline fontSize="small" /> Delete</button>
                    </div>
                  </div>
                </div>;
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
