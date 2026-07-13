import { useState, useEffect, useRef, useCallback } from "react";
import StudentLayout from "@/components/portal/StudentLayout";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronLeft, CheckCircle, Eye, ExternalLink, FileText, GraduationCap, Paperclip, Play, Video } from "lucide-react";
import ProtectedContent from "@/components/portal/ProtectedContent";

// ─── Lesson Materials Viewer ─────────────────────────────────────────────────
function LessonMaterialsList({ lessonId }: { lessonId: number }) {
  const { data: materials } = trpc.materials.list.useQuery({ lessonId });
  if (!materials || materials.length === 0) return null;
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-semibold">مواد إضافية</p>
      </div>
      <div className="space-y-2">
        {materials.map((m: any) => (
          <a
            key={m.id}
            href={m.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            {m.type === "video" ? (
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-blue-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
            )}
            <span className="flex-1 text-sm font-medium">{m.titleAr}</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

// Declare YT global for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Extract YouTube video ID from embed URL
function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Load YouTube IFrame API once
function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const existing = document.getElementById("yt-api-script");
    if (existing) {
      const check = setInterval(() => {
        if (window.YT && window.YT.Player) { clearInterval(check); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = "yt-api-script";
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
}

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: number;
  lessonTitle: string;
  onProgressUpdate: (percent: number, seconds: number) => void;
  initialProgress?: number;
}

function YouTubeTrackedPlayer({ videoUrl, lessonId, lessonTitle, onProgressUpdate, initialProgress = 0 }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxWatchedRef = useRef<number>(initialProgress);
  const startTimeRef = useRef<number>(0);
  const totalSecondsRef = useRef<number>(0);
  const [watchedPercent, setWatchedPercent] = useState(initialProgress);
  const videoId = extractYouTubeId(videoUrl);

  const reportProgress = useCallback((percent: number, seconds: number) => {
    onProgressUpdate(percent, seconds);
  }, [onProgressUpdate]);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    const containerId = `yt-player-${lessonId}`;
    containerRef.current.id = containerId;

    loadYouTubeAPI().then(() => {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onStateChange: (event: any) => {
            const YT = window.YT;
            if (event.data === YT.PlayerState.PLAYING) {
              startTimeRef.current = Date.now();
              intervalRef.current = setInterval(() => {
                const player = playerRef.current;
                if (!player || typeof player.getCurrentTime !== "function") return;
                const current = player.getCurrentTime();
                const duration = player.getDuration();
                if (duration > 0) {
                  const pct = Math.round((current / duration) * 100);
                  if (pct > maxWatchedRef.current) {
                    maxWatchedRef.current = pct;
                    setWatchedPercent(pct);
                    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
                    totalSecondsRef.current += elapsed;
                    startTimeRef.current = Date.now();
                    reportProgress(pct, totalSecondsRef.current);
                  }
                }
              }, 5000); // report every 5 seconds
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
              const player = playerRef.current;
              if (player && typeof player.getCurrentTime === "function") {
                const current = player.getCurrentTime();
                const duration = player.getDuration();
                if (duration > 0) {
                  const pct = Math.round((current / duration) * 100);
                  const finalPct = Math.max(pct, maxWatchedRef.current);
                  maxWatchedRef.current = finalPct;
                  setWatchedPercent(finalPct);
                  const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
                  totalSecondsRef.current += elapsed;
                  reportProgress(finalPct, totalSecondsRef.current);
                }
              }
            }
          },
        },
      });
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
    };
  }, [videoId, lessonId, reportProgress]);

  if (!videoId) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={videoUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={lessonTitle}
        />
      </div>
    );
  }

  return (
    <div>
      {/* YouTube Player Container */}
      <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingTop: "56.25%" }}>
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      </div>
      {/* Watch Progress Bar */}
      <div className="mt-3 flex items-center gap-3">
        <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">نسبة المشاهدة</span>
            <span className={`font-bold ${watchedPercent >= 80 ? "text-emerald-600" : watchedPercent >= 40 ? "text-amber-600" : "text-muted-foreground"}`}>
              {watchedPercent}%
            </span>
          </div>
          <Progress value={watchedPercent} className="h-1.5" />
        </div>
        {watchedPercent >= 80 && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium flex-shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            مكتمل
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentLesson() {
  const params = useParams<{ id: string }>();
  const unitId = Number(params.id);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  const { data: unit } = trpc.units.get.useQuery({ id: unitId });
  const { data: lessons } = trpc.lessons.listByUnit.useQuery({ unitId });
  const { data: tests } = trpc.tests.listByUnit.useQuery({ unitId });
  const { data: enrollments } = trpc.students.getEnrollments.useQuery();
  const { data: myVideoProgress } = trpc.videoWatch.myProgress.useQuery();

  const reportProgress = trpc.videoWatch.reportProgress.useMutation();

  const isEnrolled = enrollments?.some((e: any) => e.unitId === unitId);
  const currentLesson = activeLesson ?? lessons?.[0];

  // Get existing progress for a lesson
  const getLessonProgress = (lessonId: number) => {
    const p = (myVideoProgress as any[])?.find((p: any) => p.lessonId === lessonId);
    return p ? Math.round(Number(p.watchedPercent)) : 0;
  };

  const handleProgressUpdate = useCallback((lessonId: number, percent: number, seconds: number) => {
    reportProgress.mutate({ lessonId, watchedPercent: percent, totalWatchSeconds: seconds });
  }, []);

  const contentTypeIcon = (type: string) => {
    if (type === "video") return <Video className="w-4 h-4 text-blue-500" />;
    if (type === "pdf") return <FileText className="w-4 h-4 text-red-500" />;
    return <BookOpen className="w-4 h-4 text-green-500" />;
  };

  if (!isEnrolled) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">هذه الوحدة غير مفعلة</h2>
          <p className="text-muted-foreground mb-6">يجب الاشتراك في هذه الوحدة للوصول إلى محتواها</p>
          <Link href="/student">
            <Button className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              العودة للكورس
            </Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/student" className="hover:text-foreground transition-colors">الكورس</Link>
        <ChevronLeft className="w-3 h-3" />
        <span className="text-foreground font-medium">{unit?.titleAr}</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar: Lessons List */}
        <div className="lg:col-span-1">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">الدروس</p>
            {lessons?.map((lesson: any) => {
              const progress = getLessonProgress(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-right flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    currentLesson?.id === lesson.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {contentTypeIcon(lesson.contentType)}
                  <span className="flex-1 truncate">{lesson.titleAr}</span>
                  {lesson.contentType === "video" && progress > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${progress >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {progress}%
                    </span>
                  )}
                  {lesson.isFreePreview && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">مجاني</span>}
                </button>
              );
            })}

            {/* Tests Section */}
            {tests && tests.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-2">الاختبارات</p>
                {tests.filter((t: any) => t.isPublished).map((test: any) => (
                  <Link key={test.id} href={`/student/test/${test.id}`}>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span className="flex-1 truncate">{test.titleAr}</span>
                      <Badge variant="outline" className="text-xs">{test.durationMinutes}د</Badge>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentLesson ? (
            <div>
              <div className="mb-4">
                <h1 className="text-xl font-bold">{currentLesson.titleAr}</h1>
                {currentLesson.titleEn && <p className="text-sm text-muted-foreground ltr">{currentLesson.titleEn}</p>}
                <div className="flex items-center gap-2 mt-2">
                  {contentTypeIcon(currentLesson.contentType)}
                  <span className="text-xs text-muted-foreground">
                    {currentLesson.contentType === "video" ? "فيديو" : currentLesson.contentType === "pdf" ? "ملف PDF" : "نص"}
                    {currentLesson.durationMinutes ? ` · ${currentLesson.durationMinutes} دقيقة` : ""}
                  </span>
                </div>
              </div>

              {/* Video Content — YouTube tracked player with ProtectedContent overlay */}
              {currentLesson.contentType === "video" && currentLesson.videoUrl && (
                <ProtectedContent>
                  <YouTubeTrackedPlayer
                    key={currentLesson.id}
                    videoUrl={currentLesson.videoUrl}
                    lessonId={currentLesson.id}
                    lessonTitle={currentLesson.titleAr}
                    initialProgress={getLessonProgress(currentLesson.id)}
                    onProgressUpdate={(pct, secs) => handleProgressUpdate(currentLesson.id, pct, secs)}
                  />
                </ProtectedContent>
              )}

              {/* PDF Content — wrapped in ProtectedContent, toolbar hidden */}
              {currentLesson.contentType === "pdf" && currentLesson.pdfUrl && (
                <ProtectedContent>
                  <div className="rounded-xl overflow-hidden border border-border bg-black">
                    <iframe
                      src={`${currentLesson.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      className="w-full"
                      style={{ height: "600px" }}
                      title={currentLesson.titleAr}
                      sandbox="allow-same-origin allow-scripts"
                    />
                  </div>
                </ProtectedContent>
              )}

              {/* Text Content */}
              {currentLesson.contentType === "text" && (
                <Card>
                  <CardContent className="p-6 prose prose-sm max-w-none">
                    <p className="text-muted-foreground">محتوى نصي للدرس</p>
                  </CardContent>
                </Card>
              )}

              {/* No content placeholder */}
              {!currentLesson.videoUrl && !currentLesson.pdfUrl && currentLesson.contentType !== "text" && (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Play className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>المحتوى قيد الإضافة</p>
                  </CardContent>
                </Card>
              )}
              {/* Additional Materials (videos + PDFs added by teacher) */}
              <LessonMaterialsList lessonId={currentLesson.id} />
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>اختر درساً من القائمة</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
