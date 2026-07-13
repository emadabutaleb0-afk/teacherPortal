import { useState, useEffect } from "react";
import TeacherLayout from "./TeacherLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Settings, Save, Lock, CreditCard, Video, DollarSign,
  Shield, Info, ExternalLink, Eye, EyeOff, Upload
} from "lucide-react";

export default function TeacherSettings() {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  // Teacher-editable fields
  const [teacherForm, setTeacherForm] = useState({
    teacherBio: "",
    welcomeMessage: "",
    vodafoneCashNumber: "",
    fawryMerchantCode: "",
    sessionPrice: "80",
    termPrice: "800",
  });

  // Super-admin-only fields (read-only for teacher)
  const [adminForm, setAdminForm] = useState({
    teacherName: "",
    subject: "",
    gradeLevel: "",
    primaryColor: "",
  });

  // Live room settings
  const [liveForm, setLiveForm] = useState({
    liveRoomUrl: "",
    liveRoomTitle: "",
    liveRoomEnabled: false,
  });

  // Check if current user is the owner/super-admin
  const isOwner = user?.role === "admin";

  useEffect(() => {
    if (settings) {
      setTeacherForm({
        teacherBio: settings.teacherBio ?? "",
        welcomeMessage: settings.welcomeMessage ?? "",
        vodafoneCashNumber: settings.vodafoneCashNumber ?? "",
        fawryMerchantCode: settings.fawryMerchantCode ?? "",
        sessionPrice: String(settings.sessionPrice ?? "80"),
        termPrice: String(settings.termPrice ?? "800"),
      });
      setAdminForm({
        teacherName: settings.teacherName ?? "",
        subject: settings.subject ?? "",
        gradeLevel: settings.gradeLevel ?? "",
        primaryColor: settings.primaryColor ?? "#2563eb",
      });
      setLiveForm({
        liveRoomUrl: settings.liveRoomUrl ?? "",
        liveRoomTitle: settings.liveRoomTitle ?? "",
        liveRoomEnabled: Boolean(settings.liveRoomEnabled),
      });
    }
  }, [settings]);

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => { utils.settings.get.invalidate(); toast.success("تم حفظ الإعدادات بنجاح"); },
    onError: (e) => toast.error(e.message),
  });
  const updateWhiteLabel = trpc.settings.updateWhiteLabel.useMutation({
    onSuccess: () => { utils.settings.get.invalidate(); toast.success("تم حفظ هوية المنصة بنجاح"); },
    onError: (e) => toast.error(e.message),
  });

  const handleSaveTeacher = () => updateSettings.mutate(teacherForm);
  const handleSaveAdmin = () => updateWhiteLabel.mutate(adminForm);
  const handleSaveLive = () => updateSettings.mutate({
    liveRoomUrl: liveForm.liveRoomUrl,
    liveRoomTitle: liveForm.liveRoomTitle,
    liveRoomEnabled: liveForm.liveRoomEnabled ? 1 : 0,
  });

  if (isLoading) {
    return (
      <TeacherLayout title="الإعدادات">
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="إعدادات المنصة">
      <div className="max-w-2xl space-y-6" dir="rtl">

        {/* ── White-Label Identity (Super-Admin / Owner Only) ── */}
        {isOwner && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-amber-300 bg-amber-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    هوية المنصة (White Label)
                  </CardTitle>
                  <Badge variant="outline" className="gap-1 border-green-300 text-green-700 bg-green-50">
                    <Shield className="w-3 h-3" />
                    صلاحية المالك
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  أنت تملك صلاحية تعديل هوية المنصة — اسم المعلم والمادة والصف الدراسي.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اسم المعلم</Label>
                  <Input
                    value={adminForm.teacherName}
                    onChange={e => setAdminForm(p => ({ ...p, teacherName: e.target.value }))}
                    className="mt-1"
                    placeholder="أستاذ أحمد محمود"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المادة الدراسية</Label>
                    <Input
                      value={adminForm.subject}
                      onChange={e => setAdminForm(p => ({ ...p, subject: e.target.value }))}
                      className="mt-1"
                      placeholder="اللغة الإنجليزية"
                    />
                  </div>
                  <div>
                    <Label>الصف الدراسي الافتراضي</Label>
                    <Input
                      value={adminForm.gradeLevel}
                      onChange={e => setAdminForm(p => ({ ...p, gradeLevel: e.target.value }))}
                      className="mt-1"
                      placeholder="الصف الثالث الثانوي"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveAdmin}
                  disabled={updateWhiteLabel.isPending}
                  size="sm"
                  className="gap-2 bg-amber-600 hover:bg-amber-700"
                >
                  <Save className="w-4 h-4" />
                  حفظ هوية المنصة
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Teacher-Editable: Bio & Welcome ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                المحتوى والترحيب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>رسالة الترحيب</Label>
                <Textarea
                  value={teacherForm.welcomeMessage}
                  onChange={e => setTeacherForm(p => ({ ...p, welcomeMessage: e.target.value }))}
                  className="mt-1"
                  rows={2}
                  placeholder="مرحباً بك في منصتنا التعليمية..."
                />
              </div>
              <div>
                <Label>نبذة عن المعلم</Label>
                <Textarea
                  value={teacherForm.teacherBio}
                  onChange={e => setTeacherForm(p => ({ ...p, teacherBio: e.target.value }))}
                  className="mt-1"
                  rows={3}
                  placeholder="خبرة 15 سنة في تدريس اللغة الإنجليزية..."
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Pricing ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                أسعار الاشتراك
              </CardTitle>
              <CardDescription className="text-xs">
                حدد سعر الحصة الواحدة وسعر الترم الكامل — تظهر هذه الأسعار للطلاب في صفحة المحفظة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>سعر الحصة الواحدة (جنيه)</Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={teacherForm.sessionPrice}
                      onChange={e => setTeacherForm(p => ({ ...p, sessionPrice: e.target.value }))}
                      className="pl-12"
                      min="1"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">جنيه</span>
                  </div>
                </div>
                <div>
                  <Label>سعر الترم الكامل (جنيه)</Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={teacherForm.termPrice}
                      onChange={e => setTeacherForm(p => ({ ...p, termPrice: e.target.value }))}
                      className="pl-12"
                      min="1"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">جنيه</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>يمكنك تعديل هذه الأسعار في أي وقت. ستنعكس التغييرات فوراً على صفحة الدفع للطلاب.</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Payment Integration ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                إعدادات الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>ملاحظة:</strong> تكامل فوري وفودافون كاش مرجعي. يتطلب التفعيل الكامل التسجيل مع مزودي الخدمة.
              </div>
              <div>
                <Label>كود تاجر فوري (Merchant Code)</Label>
                <Input
                  value={teacherForm.fawryMerchantCode}
                  onChange={e => setTeacherForm(p => ({ ...p, fawryMerchantCode: e.target.value }))}
                  className="mt-1"
                  dir="ltr"
                  placeholder="FAWRY_MERCHANT_CODE"
                />
              </div>
              <div>
                <Label>رقم فودافون كاش</Label>
                <Input
                  value={teacherForm.vodafoneCashNumber}
                  onChange={e => setTeacherForm(p => ({ ...p, vodafoneCashNumber: e.target.value }))}
                  className="mt-1"
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Live Lectures ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600" />
                الحصص المباشرة (Live)
              </CardTitle>
              <CardDescription className="text-xs">
                أضف رابط غرفة Zoom أو Google Meet أو Microsoft Teams — سيظهر للطلاب زر "انضم للحصة المباشرة".
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                  <p className="font-medium text-sm">تفعيل الحصص المباشرة</p>
                  <p className="text-xs text-muted-foreground">يظهر زر الانضمام للطلاب عند التفعيل</p>
                </div>
                <Switch
                  checked={liveForm.liveRoomEnabled}
                  onCheckedChange={v => setLiveForm(p => ({ ...p, liveRoomEnabled: v }))}
                />
              </div>
              <div>
                <Label>عنوان الحصة</Label>
                <Input
                  value={liveForm.liveRoomTitle}
                  onChange={e => setLiveForm(p => ({ ...p, liveRoomTitle: e.target.value }))}
                  className="mt-1"
                  placeholder="حصة مراجعة Unit 1 — الثلاثاء 7 مساءً"
                />
              </div>
              <div>
                <Label>رابط الغرفة</Label>
                <Input
                  value={liveForm.liveRoomUrl}
                  onChange={e => setLiveForm(p => ({ ...p, liveRoomUrl: e.target.value }))}
                  className="mt-1"
                  dir="ltr"
                  placeholder="https://zoom.us/j/... أو https://meet.google.com/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  يدعم Zoom وGoogle Meet وMicrosoft Teams وأي رابط اجتماع آخر.
                </p>
              </div>
              {liveForm.liveRoomUrl && (
                <a
                  href={liveForm.liveRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  اختبر الرابط
                </a>
              )}
              <Button
                onClick={handleSaveLive}
                disabled={updateSettings.isPending}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ إعدادات البث المباشر
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Save all teacher settings ── */}
        <Button
          onClick={handleSaveTeacher}
          disabled={updateSettings.isPending}
          className="w-full gap-2"
          size="lg"
        >
          <Save className="w-4 h-4" />
          {updateSettings.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </div>
    </TeacherLayout>
  );
}
