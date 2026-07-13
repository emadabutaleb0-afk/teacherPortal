import { useState, useEffect } from "react";
import StudentLayout from "@/components/portal/StudentLayout";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, ExternalLink, Radio, Video, Wifi, WifiOff } from "lucide-react";

export default function StudentLivePass() {
  const params = useParams<{ id: string }>();
  const unitId = Number(params.id);

  const { data: unit } = trpc.units.get.useQuery({ id: unitId });
  const { data: enrollments } = trpc.students.getEnrollments.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  const [now, setNow] = useState(new Date());

  // Tick every second to keep the "live" badge fresh
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isEnrolled = enrollments?.some((e: any) => e.unitId === unitId);
  const isLive = settings?.liveRoomEnabled === 1;
  const liveUrl = settings?.liveRoomUrl;
  const liveTitle = settings?.liveRoomTitle ?? "الحصة المباشرة";

  if (!isEnrolled) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">هذه الباقة غير مفعلة</h2>
          <p className="text-muted-foreground mb-6">يجب الاشتراك في باقة الحصص المباشرة للوصول إليها</p>
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
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/student" className="hover:text-foreground transition-colors">الكورس</Link>
        <ChevronLeft className="w-3 h-3" />
        <span className="text-foreground font-medium">{unit?.titleAr}</span>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Live Status Card */}
        <Card className={`overflow-hidden border-2 transition-all duration-500 ${isLive ? "border-red-400 shadow-lg shadow-red-100" : "border-border"}`}>
          <div className={`px-6 py-4 flex items-center justify-between ${isLive ? "bg-red-50" : "bg-muted/30"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLive ? "bg-red-100" : "bg-muted"}`}>
                {isLive ? (
                  <Radio className="w-5 h-5 text-red-600 animate-pulse" />
                ) : (
                  <WifiOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-bold text-base">{isLive ? liveTitle : "لا يوجد بث مباشر الآن"}</p>
                <p className="text-xs text-muted-foreground">
                  {isLive
                    ? `البث نشط · ${now.toLocaleTimeString("ar-EG")}`
                    : "سيتم إشعارك عند بدء الحصة التالية"}
                </p>
              </div>
            </div>
            {isLive ? (
              <Badge className="bg-red-500 text-white border-0 animate-pulse px-3 py-1 text-xs font-bold">
                🔴 مباشر
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                في انتظار البث
              </Badge>
            )}
          </div>

          <CardContent className="p-6">
            {isLive && liveUrl ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  الحصة المباشرة جارية الآن. اضغط الزر أدناه للانضمام فوراً.
                </p>
                <a href={liveUrl} target="_blank" rel="noreferrer" className="block">
                  <Button className="w-full gap-2 h-12 text-base bg-red-500 hover:bg-red-600 text-white shadow-md">
                    <ExternalLink className="w-5 h-5" />
                    انضم للحصة المباشرة الآن
                  </Button>
                </a>
                <p className="text-xs text-center text-muted-foreground">
                  سيتم فتح رابط الحصة في نافذة جديدة
                </p>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Video className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <p className="text-muted-foreground text-sm">
                  لا توجد حصة مباشرة في الوقت الحالي.
                  <br />
                  ستصلك إشعارات فور بدء أي حصة جديدة.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Info Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">اشتراكك النشط</p>
                <p className="text-sm text-muted-foreground">{unit?.titleAr}</p>
                <p className="text-xs text-muted-foreground mt-1">{unit?.description}</p>
                <Badge variant="outline" className="mt-2 text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                  ✓ مشترك ونشط
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">نصائح للحصة المباشرة</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>تأكد من اتصالك بالإنترنت قبل بدء الحصة بـ 5 دقائق</li>
            <li>استخدم سماعات للحصول على أفضل جودة صوت</li>
            <li>أبقِ هذه الصفحة مفتوحة لتلقي الإشعارات فور بدء البث</li>
            <li>في حال انقطع البث، أعد تحميل الصفحة والنقر على زر الانضمام</li>
          </ul>
        </div>
      </div>
    </StudentLayout>
  );
}
