import { useState, useEffect, useCallback } from "react";
import StudentLayout from "./StudentLayout";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle, ChevronLeft, Clock, GraduationCap, XCircle } from "lucide-react";

type Phase = "intro" | "taking" | "result";

export default function StudentTakeTest() {
  const params = useParams<{ id: string }>();
  const testId = Number(params.id);

  const { data: test } = trpc.tests.get.useQuery({ id: testId });
  const { data: questions } = trpc.questions.listByTest.useQuery({ testId });
  const { data: studentData } = trpc.students.getMyProfile.useQuery();

  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<any>(null);

  const submitTest = trpc.testTaking.submitTest.useMutation({
    onSuccess: (data: any) => {
      setResult(data);
      setPhase("result");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Timer
  useEffect(() => {
    if (phase !== "taking" || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  function startTest() {
    if (!test) return;
    setAnswers({});
    setTimeLeft(test.durationMinutes * 60);
    setPhase("taking");
  }

  const handleSubmit = useCallback(() => {
    if (!questions || !studentData) return;
    submitTest.mutate({
      testId,
      answers: Object.entries(answers).map(([qId, answer]) => ({
        questionId: Number(qId),
        selected: answer as "A" | "B" | "C" | "D",
      })),
    });
  }, [questions, studentData, answers, testId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions?.length ?? 0;

  // ─── INTRO PHASE ────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <StudentLayout>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/student" className="hover:text-foreground">الكورس</Link>
            <ChevronLeft className="w-3 h-3" />
            <span className="text-foreground font-medium">{test?.titleAr}</span>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-black mb-2">{test?.titleAr}</h1>
              <p className="text-muted-foreground text-sm mb-6">استعد للاختبار</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-2xl font-black text-primary">{totalQuestions}</p>
                  <p className="text-xs text-muted-foreground">سؤال</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-2xl font-black text-primary">{test?.durationMinutes}</p>
                  <p className="text-xs text-muted-foreground">دقيقة</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-2xl font-black text-primary">{test?.passingScore}%</p>
                  <p className="text-xs text-muted-foreground">للنجاح</p>
                </div>
              </div>

              <div className="text-right text-sm text-muted-foreground mb-6 space-y-1">
                <p>• اقرأ كل سؤال بعناية قبل الإجابة</p>
                <p>• يمكنك تغيير إجابتك قبل التسليم</p>
                <p>• سيتم التسليم تلقائياً عند انتهاء الوقت</p>
                <p>• ستحصل على شرح فوري للإجابات الخاطئة</p>
              </div>

              {test?.availableFrom && new Date() < new Date(test.availableFrom) ? (
                <div className="bg-amber-500/15 border border-amber-500/30 text-amber-500 rounded-xl p-4 text-xs mb-6 text-right">
                  ⚠️ هذا الاختبار غير متاح بعد. سيكون متاحاً للبدء في: {new Date(test.availableFrom).toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" })}
                </div>
              ) : test?.availableUntil && new Date() > new Date(test.availableUntil) ? (
                <div className="bg-destructive/15 border border-destructive/30 text-destructive rounded-xl p-4 text-xs mb-6 text-right">
                  🚫 انتهى وقت هذا الاختبار. كان متاحاً حتى: {new Date(test.availableUntil).toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" })}
                </div>
              ) : (
                (test?.availableFrom || test?.availableUntil) && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-xl p-4 text-xs mb-6 text-right space-y-1">
                    <p className="font-semibold">⏱️ فترة إتاحة الاختبار المحددة:</p>
                    {test.availableFrom && <p>• تاريخ البدء: {new Date(test.availableFrom).toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" })}</p>}
                    {test.availableUntil && <p>• تاريخ الانتهاء: {new Date(test.availableUntil).toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" })}</p>}
                  </div>
                )
              )}

              <Button
                onClick={startTest}
                size="lg"
                className="w-full gap-2"
                disabled={
                  (test?.availableFrom && new Date() < new Date(test.availableFrom)) ||
                  (test?.availableUntil && new Date() > new Date(test.availableUntil))
                }
              >
                <GraduationCap className="w-5 h-5" />
                ابدأ الاختبار الآن
              </Button>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  // ─── TAKING PHASE ───────────────────────────────────────────────────────────
  if (phase === "taking") {
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto">
          {/* Timer Bar */}
          <div className="sticky top-16 z-40 bg-card border border-border rounded-xl p-3 mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary"}`} />
              <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? "text-red-500" : "text-foreground"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{answeredCount}/{totalQuestions} إجابة</span>
              <Progress value={(answeredCount / totalQuestions) * 100} className="w-24 h-2" />
            </div>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitTest.isPending}
              className="gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              تسليم
            </Button>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions?.map((q: any, idx: number) => (
              <Card key={q.id} className={`transition-all ${answers[q.id] ? "border-primary/30" : "border-border"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="font-medium text-sm leading-relaxed ltr text-right flex-1" dir="ltr">{q.questionText}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(["A", "B", "C", "D"] as const).map(opt => {
                      const optText = q[`option${opt}` as keyof typeof q] as string;
                      const isSelected = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 text-right transition-all text-sm ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                          }`}>
                            {opt}
                          </span>
                          <span className="ltr flex-1 text-right" dir="ltr">{optText}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitTest.isPending}
            size="lg"
            className="w-full mt-6 gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            تسليم الاختبار ({answeredCount}/{totalQuestions} إجابة)
          </Button>
        </div>
      </StudentLayout>
    );
  }

  // ─── RESULT PHASE ───────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const isPassed = result.isPassed;
    const percentage = result.percentage;

    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto">
          {/* Score Card */}
          <Card className={`mb-6 border-2 ${isPassed ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isPassed ? "bg-emerald-100" : "bg-red-100"}`}>
                {isPassed ? (
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-600" />
                )}
              </div>
              <h2 className={`text-3xl font-black mb-2 ${isPassed ? "text-emerald-700" : "text-red-700"}`}>
                {isPassed ? "🎉 مبروك! نجحت" : "حاول مرة أخرى"}
              </h2>
              <p className={`text-5xl font-black mb-3 ${isPassed ? "text-emerald-600" : "text-red-600"}`}>
                {percentage}%
              </p>
              <p className="text-sm text-muted-foreground">
                {result.correctCount} من {result.totalQuestions} إجابة صحيحة
              </p>
              <div className="mt-4 flex justify-center gap-4 text-sm">
                <span className="text-emerald-600 font-semibold">✓ {result.correctCount} صحيح</span>
                <span className="text-red-600 font-semibold">✗ {result.totalQuestions - result.correctCount} خطأ</span>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          <h3 className="text-lg font-bold mb-4">مراجعة الإجابات</h3>
          <div className="space-y-4">
            {result.feedback?.map((item: any, idx: number) => (
              <Card key={item.questionId} className={`border-2 ${item.isCorrect ? "border-emerald-200" : "border-red-200"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      item.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {idx + 1}
                    </span>
                    <p className="font-medium text-sm ltr text-right flex-1" dir="ltr">{item.questionText}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className={`p-2 rounded-lg text-xs ${item.isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      <p className="font-semibold mb-0.5">إجابتك:</p>
                      <p className="ltr">{item.selectedOption}. {item.selectedOptionText}</p>
                    </div>
                    {!item.isCorrect && (
                      <div className="p-2 rounded-lg text-xs bg-emerald-50 text-emerald-700">
                        <p className="font-semibold mb-0.5">الإجابة الصحيحة:</p>
                        <p className="ltr">{item.correctOption}. {item.correctOptionText}</p>
                      </div>
                    )}
                  </div>

                  {!item.isCorrect && item.explanation && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-1">💡 الشرح:</p>
                      <p className="text-xs text-blue-700 leading-relaxed">{item.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Link href="/student" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ChevronLeft className="w-4 h-4" />
                العودة للكورس
              </Button>
            </Link>
            <Button onClick={() => { setPhase("intro"); setAnswers({}); }} className="flex-1 gap-2">
              <GraduationCap className="w-4 h-4" />
              إعادة الاختبار
            </Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return null;
}
