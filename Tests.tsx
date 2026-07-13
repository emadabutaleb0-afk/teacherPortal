import { useState, useMemo, useEffect } from "react";
import TeacherLayout from "./TeacherLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Edit, GraduationCap, Plus, Trash2, Users, Upload, FileText } from "lucide-react";

const GRADE_OPTIONS = [
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
];

export default function TeacherTests() {
  const utils = trpc.useUtils();
  const { data: units } = trpc.units.list.useQuery();
  const { data: gradeLevels } = trpc.units.gradeLevels.useQuery();
  const allGrades = useMemo(() => gradeLevels ?? [], [gradeLevels]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const [testDialog, setTestDialog] = useState(false);
  const [questionDialog, setQuestionDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

  // Grade filtering state
  const [activeGrade, setActiveGrade] = useState("all");
  const filteredUnits = useMemo(() => {
    if (!units) return [];
    if (activeGrade === "all") return units;
    return units.filter((u: any) => u.gradeLevel === activeGrade);
  }, [units, activeGrade]);

  const handleGradeChange = (grade: string) => {
    setActiveGrade(grade);
    setSelectedUnitId(null);
    setExpandedTest(null);
  };

  // Student Assignment State
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignTestId, setAssignTestId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());

  const { data: students } = trpc.students.list.useQuery();
  const { data: assignedIds } = trpc.tests.getAssignedStudents.useQuery(
    { testId: assignTestId! },
    { enabled: assignTestId !== null }
  );

  const assignedIdsString = JSON.stringify(assignedIds);
  useEffect(() => {
    if (assignedIds) {
      setSelectedStudentIds(new Set(assignedIds));
    }
  }, [assignedIdsString]);

  const assignMutation = trpc.tests.assignToStudents.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين الاختبار للطلاب بنجاح");
      setAssignDialog(false);
    },
    onError: (e: any) => toast.error(e.message)
  });

  function openAssignDialog(testId: number) {
    setAssignTestId(testId);
    setSelectedStudentIds(new Set());
    setAssignDialog(true);
  }

  const { data: tests } = trpc.tests.listByUnit.useQuery(
    { unitId: selectedUnitId! },
    { enabled: selectedUnitId !== null }
  );
  const { data: questions } = trpc.questions.listByTest.useQuery(
    { testId: expandedTest! },
    { enabled: expandedTest !== null }
  );

  const createTest = trpc.tests.create.useMutation({ onSuccess: () => { utils.tests.listByUnit.invalidate(); setTestDialog(false); toast.success("تم إنشاء الاختبار"); }, onError: (e: any) => toast.error(e.message) });
  const updateTest = trpc.tests.update.useMutation({ onSuccess: () => { utils.tests.listByUnit.invalidate(); setTestDialog(false); toast.success("تم تحديث الاختبار"); }, onError: (e: any) => toast.error(e.message) });
  const deleteTest = trpc.tests.delete.useMutation({ onSuccess: () => { utils.tests.listByUnit.invalidate(); toast.success("تم حذف الاختبار"); }, onError: (e: any) => toast.error(e.message) });
  const createQuestion = trpc.questions.create.useMutation({ onSuccess: () => { utils.questions.listByTest.invalidate(); setQuestionDialog(false); toast.success("تم إضافة السؤال"); }, onError: (e: any) => toast.error(e.message) });
  const updateQuestion = trpc.questions.update.useMutation({ onSuccess: () => { utils.questions.listByTest.invalidate(); setQuestionDialog(false); toast.success("تم تحديث السؤال"); }, onError: (e: any) => toast.error(e.message) });
  const deleteQuestion = trpc.questions.delete.useMutation({ onSuccess: () => { utils.questions.listByTest.invalidate(); toast.success("تم حذف السؤال"); }, onError: (e: any) => toast.error(e.message) });

  const [testForm, setTestForm] = useState({ titleAr: "", titleEn: "", durationMinutes: 30, passingScore: 60, isPublished: false, availableFrom: "", availableUntil: "" });
  const [qForm, setQForm] = useState({ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" as "A"|"B"|"C"|"D", explanation: "", points: 1, orderIndex: 0 });

  // Bulk import state
  const [bulkDialog, setBulkDialog] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkTestId, setBulkTestId] = useState<number | null>(null);

  const bulkCreate = trpc.questions.bulkCreate.useMutation({
    onSuccess: (data: any) => {
      utils.questions.listByTest.invalidate();
      setBulkDialog(false);
      setBulkText("");
      toast.success(`تم استيراد ${data?.count ?? 0} سؤال بنجاح`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  function parseQuestions(text: string) {
    const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
    return blocks.map(block => {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      const q: any = { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", explanation: "", points: 1 };
      for (const line of lines) {
        if (line.match(/^Q:\s*/i)) q.questionText = line.replace(/^Q:\s*/i, "");
        else if (line.match(/^A:\s*/i)) q.optionA = line.replace(/^A:\s*/i, "");
        else if (line.match(/^B:\s*/i)) q.optionB = line.replace(/^B:\s*/i, "");
        else if (line.match(/^C:\s*/i)) q.optionC = line.replace(/^C:\s*/i, "");
        else if (line.match(/^D:\s*/i)) q.optionD = line.replace(/^D:\s*/i, "");
        else if (line.match(/^Answer:\s*/i)) q.correctOption = line.replace(/^Answer:\s*/i, "").trim().toUpperCase();
        else if (line.match(/^Explanation:\s*/i)) q.explanation = line.replace(/^Explanation:\s*/i, "");
      }
      return q;
    }).filter(q => q.questionText && q.optionA && q.optionB && q.optionC && q.optionD);
  }

  const parsedCount = useMemo(() => parseQuestions(bulkText).length, [bulkText]);

  function openBulkImport(testId: number) {
    setBulkTestId(testId);
    setBulkText("");
    setBulkDialog(true);
  }

  function submitBulkImport() {
    const parsed = parseQuestions(bulkText);
    if (parsed.length === 0) { toast.error("لم يتم العثور على أسئلة صالحة. تأكد من الصيغة."); return; }
    bulkCreate.mutate({ testId: bulkTestId!, questions: parsed });
  }

  function openNewTest() {
    if (!selectedUnitId) { toast.error("يرجى اختيار وحدة أولاً"); return; }
    setEditingTest(null);
    setTestForm({ titleAr: "", titleEn: "", durationMinutes: 30, passingScore: 60, isPublished: false, availableFrom: "", availableUntil: "" });
    setTestDialog(true);
  }
  function openEditTest(test: any) {
    setEditingTest(test);
    setTestForm({ titleAr: test.titleAr, titleEn: test.titleEn ?? "", durationMinutes: test.durationMinutes, passingScore: test.passingScore, isPublished: test.isPublished, availableFrom: test.availableFrom ?? "", availableUntil: test.availableUntil ?? "" });
    setTestDialog(true);
  }
  function openNewQuestion(testId: number) {
    setEditingQuestion(null);
    setSelectedTestId(testId);
    setQForm({ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", explanation: "", points: 1, orderIndex: (questions?.length ?? 0) + 1 });
    setQuestionDialog(true);
  }
  function openEditQuestion(q: any) {
    setEditingQuestion(q);
    setSelectedTestId(q.testId);
    setQForm({ questionText: q.questionText, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption, explanation: q.explanation ?? "", points: q.points, orderIndex: q.orderIndex });
    setQuestionDialog(true);
  }

  function submitTest() {
    if (!testForm.titleAr) { toast.error("يرجى إدخال عنوان الاختبار"); return; }
    if (editingTest) updateTest.mutate({ id: editingTest.id, ...testForm });
    else createTest.mutate({ unitId: selectedUnitId!, ...testForm });
  }
  function submitQuestion() {
    if (!qForm.questionText || !qForm.optionA || !qForm.optionB || !qForm.optionC || !qForm.optionD) { toast.error("يرجى ملء جميع الحقول"); return; }
    if (editingQuestion) updateQuestion.mutate({ id: editingQuestion.id, ...qForm });
    else createQuestion.mutate({ testId: selectedTestId!, ...qForm });
  }

  return (
    <TeacherLayout title="الاختبارات">
      {/* Grade level filter combo box */}
      <div className="flex items-center gap-3 bg-muted/40 dark:bg-muted/10 p-3 rounded-xl border border-border/40 w-fit mb-6">
        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">تصفية حسب الصف:</span>
        <Select value={activeGrade} onValueChange={handleGradeChange}>
          <SelectTrigger className="w-56 h-9 rounded-lg text-xs bg-background">
            <SelectValue placeholder="اختر الصف الدراسي..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">الكل ({units?.length ?? 0})</SelectItem>
            {allGrades.map((grade: string) => (
              <SelectItem key={grade} value={grade} className="text-xs">
                {grade} ({units?.filter((u: any) => u.gradeLevel === grade).length ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Unit Selector */}
      <div className="flex items-center gap-4 mb-6">
        <Label className="text-sm font-semibold whitespace-nowrap">اختر الوحدة:</Label>
        <Select value={selectedUnitId?.toString() ?? ""} onValueChange={v => { setSelectedUnitId(Number(v)); setExpandedTest(null); }}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="اختر وحدة..." />
          </SelectTrigger>
          <SelectContent>
            {filteredUnits?.map((u: any) => <SelectItem key={u.id} value={u.id.toString()}>{u.titleAr}</SelectItem>)}
          </SelectContent>
        </Select>
        {selectedUnitId && (
          <Button onClick={openNewTest} className="gap-2 mr-auto">
            <Plus className="w-4 h-4" />
            اختبار جديد
          </Button>
        )}
      </div>

      {!selectedUnitId ? (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>اختر وحدة لعرض اختباراتها</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests?.map((test: any) => (
            <Card key={test.id}>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30" onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">{test.titleAr}</p>
                    <p className="text-xs text-muted-foreground">
                      {test.durationMinutes} دقيقة · نجاح {test.passingScore}%
                      {test.availableFrom && ` · متاح من: ${new Date(test.availableFrom).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}`}
                      {test.availableUntil && ` · متاح إلى: ${new Date(test.availableUntil).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={test.isPublished ? "default" : "secondary"} className="text-xs">{test.isPublished ? "منشور" : "مسودة"}</Badge>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-primary animate-pulse-subtle" title="تعيين للطلاب" onClick={e => { e.stopPropagation(); openAssignDialog(test.id); }}><Users className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={e => { e.stopPropagation(); openEditTest(test); }}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={e => { e.stopPropagation(); if (confirm("حذف الاختبار؟")) deleteTest.mutate({ id: test.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  {expandedTest === test.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {expandedTest === test.id && (
                <div className="border-t border-border bg-muted/20 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-muted-foreground">الأسئلة ({questions?.length ?? 0})</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => openBulkImport(test.id)}>
                        <Upload className="w-3 h-3" />استيراد أسئلة
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => openNewQuestion(test.id)}>
                        <Plus className="w-3 h-3" />سؤال جديد
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {questions?.map((q: any, idx: number) => (
                      <div key={q.id} className="bg-card rounded-lg p-3 border border-border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium ltr text-right" dir="ltr">{idx + 1}. {q.questionText}</p>
                            <div className="grid grid-cols-2 gap-1 mt-2">
                              {["A","B","C","D"].map(opt => (
                                <span key={opt} className={`text-xs px-2 py-1 rounded ${q.correctOption === opt ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-muted text-muted-foreground"}`}>
                                  {opt}. {q[`option${opt}` as keyof typeof q] as string}
                                </span>
                              ))}
                            </div>
                            {q.explanation && <p className="text-xs text-muted-foreground mt-2 bg-blue-50 p-2 rounded">{q.explanation}</p>}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => openEditQuestion(q)}><Edit className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="w-6 h-6 text-destructive" onClick={() => { if (confirm("حذف السؤال؟")) deleteQuestion.mutate({ id: q.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!questions?.length && <p className="text-xs text-muted-foreground text-center py-3">لا توجد أسئلة بعد</p>}
                  </div>
                </div>
              )}
            </Card>
          ))}
          {!tests?.length && (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>لا توجد اختبارات لهذه الوحدة</p>
            </div>
          )}
        </div>
      )}

      {/* Test Dialog */}
      <Dialog open={testDialog} onOpenChange={setTestDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>{editingTest ? "تعديل الاختبار" : "اختبار جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>عنوان الاختبار *</Label><Input value={testForm.titleAr} onChange={e => setTestForm(p => ({...p, titleAr: e.target.value}))} className="mt-1" /></div>
            <div><Label>العنوان بالإنجليزية</Label><Input value={testForm.titleEn} onChange={e => setTestForm(p => ({...p, titleEn: e.target.value}))} className="mt-1 ltr" dir="ltr" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>المدة (دقيقة)</Label><Input type="number" value={testForm.durationMinutes} onChange={e => setTestForm(p => ({...p, durationMinutes: Number(e.target.value)}))} className="mt-1" /></div>
              <div><Label>درجة النجاح (%)</Label><Input type="number" value={testForm.passingScore} onChange={e => setTestForm(p => ({...p, passingScore: Number(e.target.value)}))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>متاح من (تاريخ ووقت)</Label><Input type="datetime-local" value={testForm.availableFrom} onChange={e => setTestForm(p => ({...p, availableFrom: e.target.value}))} className="mt-1 text-xs" /></div>
              <div><Label>متاح إلى (تاريخ ووقت)</Label><Input type="datetime-local" value={testForm.availableUntil} onChange={e => setTestForm(p => ({...p, availableUntil: e.target.value}))} className="mt-1 text-xs" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={testForm.isPublished} onCheckedChange={v => setTestForm(p => ({...p, isPublished: v}))} /><Label>منشور للطلاب</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialog(false)}>إلغاء</Button>
            <Button onClick={submitTest} disabled={createTest.isPending || updateTest.isPending}>{editingTest ? "حفظ" : "إنشاء"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editingQuestion ? "تعديل السؤال" : "سؤال جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            <div><Label>نص السؤال *</Label><Textarea value={qForm.questionText} onChange={e => setQForm(p => ({...p, questionText: e.target.value}))} className="mt-1 ltr" dir="ltr" rows={2} /></div>
            {["A","B","C","D"].map(opt => (
              <div key={opt}><Label>الخيار {opt} *</Label><Input value={qForm[`option${opt}` as keyof typeof qForm] as string} onChange={e => setQForm(p => ({...p, [`option${opt}`]: e.target.value}))} className="mt-1 ltr" dir="ltr" /></div>
            ))}
            <div>
              <Label>الإجابة الصحيحة</Label>
              <Select value={qForm.correctOption} onValueChange={(v: any) => setQForm(p => ({...p, correctOption: v}))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{["A","B","C","D"].map(o => <SelectItem key={o} value={o}>الخيار {o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>شرح الإجابة الخاطئة</Label><Textarea value={qForm.explanation} onChange={e => setQForm(p => ({...p, explanation: e.target.value}))} className="mt-1" rows={3} placeholder="اشرح لماذا الإجابات الأخرى خاطئة..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الدرجة</Label><Input type="number" value={qForm.points} onChange={e => setQForm(p => ({...p, points: Number(e.target.value)}))} className="mt-1" /></div>
              <div><Label>الترتيب</Label><Input type="number" value={qForm.orderIndex} onChange={e => setQForm(p => ({...p, orderIndex: Number(e.target.value)}))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialog(false)}>إلغاء</Button>
            <Button onClick={submitQuestion} disabled={createQuestion.isPending || updateQuestion.isPending}>{editingQuestion ? "حفظ" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Test Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent className="max-w-md font-sans" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعيين الاختبار للطلاب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">قائمة الطلاب النشطين ({students?.length ?? 0})</span>
              <button
                type="button"
                onClick={() => {
                  if (selectedStudentIds.size === students?.length) {
                    setSelectedStudentIds(new Set());
                  } else {
                    setSelectedStudentIds(new Set(students?.map((s: any) => s.id) || []));
                  }
                }}
                className="text-xs text-primary hover:underline font-semibold"
              >
                {selectedStudentIds.size === students?.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
              </button>
            </div>
            
            <div className="border border-border/80 rounded-xl max-h-[40vh] overflow-y-auto divide-y divide-border/60">
              {students?.map((student: any) => {
                const isChecked = selectedStudentIds.has(student.id);
                return (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer select-none transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const next = new Set(selectedStudentIds);
                        if (isChecked) next.delete(student.id);
                        else next.add(student.id);
                        setSelectedStudentIds(next);
                      }}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold">{student.nameAr}</p>
                      <p className="text-xs text-muted-foreground">{student.phone} · {student.gradeLevel}</p>
                    </div>
                  </label>
                );
              })}
              {!students?.length && (
                <div className="py-8 text-center text-xs text-muted-foreground">لا يوجد طلاب مسجلين</div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAssignDialog(false)}>إلغاء</Button>
            <Button
              onClick={() => assignMutation.mutate({ testId: assignTestId!, studentIds: Array.from(selectedStudentIds) })}
              disabled={assignMutation.isPending}
              className="gap-1"
            >
              حفظ التعيين
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Questions Dialog */}
      <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              استيراد أسئلة بالجملة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2">صيغة الكتابة (افصل بين كل سؤال بسطر فارغ):</p>
              <pre className="text-xs text-muted-foreground bg-card rounded p-2 border border-border/50 whitespace-pre-wrap ltr" dir="ltr">{`Q: What is the past tense of "go"?
A: went
B: goed
C: gone
D: going
Answer: A
Explanation: "went" is the irregular past tense

Q: Choose the correct sentence:
A: She don't like coffee
B: She doesn't likes coffee
C: She doesn't like coffee
D: She not like coffee
Answer: C`}</pre>
            </div>
            <div>
              <Label className="flex items-center justify-between">
                <span>الصق الأسئلة هنا</span>
                {bulkText && (
                  <Badge variant={parsedCount > 0 ? "default" : "destructive"} className="text-xs">
                    {parsedCount > 0 ? `✓ تم التعرف على ${parsedCount} سؤال` : "لا توجد أسئلة صالحة"}
                  </Badge>
                )}
              </Label>
              <Textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                className="mt-1 ltr font-mono text-sm"
                dir="ltr"
                rows={12}
                placeholder={"Q: Question text here\nA: Option A\nB: Option B\nC: Option C\nD: Option D\nAnswer: A\nExplanation: Optional explanation\n\nQ: Next question..."}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBulkDialog(false)}>إلغاء</Button>
            <Button onClick={submitBulkImport} disabled={bulkCreate.isPending || parsedCount === 0} className="gap-2">
              <Upload className="w-4 h-4" />
              {bulkCreate.isPending ? "جاري الاستيراد..." : `استيراد ${parsedCount} سؤال`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
