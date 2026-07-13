import { useState, useEffect } from "react";
import TeacherLayout from "@/components/portal/TeacherLayout";
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
  Shield, Info, ExternalLink, Eye, EyeOff, Upload, UserPlus, Key,
  MessageCircle, Send, CheckCircle2, Loader2
} from "lucide-react";
import { getWAConfig, saveWAConfig, sendWhatsApp, sendWhatsAppBulk, WA_TEMPLATES, normalizePhone } from "@/lib/whatsapp";

export default function TeacherSettings() {
  // ── WhatsApp state ────────────────────────────────────────────────────────
  const [waConfig, setWaConfig] = useState({
    instanceId: '',
    token: '',
    enabled: false,
    teacherPhone: '',
  });
  const [waTokenVisible, setWaTokenVisible] = useState(false);
  const [waTesting, setWaTesting] = useState(false);
  const [waTestSent, setWaTestSent] = useState(false);

  useEffect(() => {
    setWaConfig(getWAConfig());
  }, []);

  const handleSaveWA = () => {
    saveWAConfig(waConfig);
    toast.success('تم حفظ إعدادات WhatsApp بنجاح ✅');
  };

  const handleTestWA = async () => {
    if (!waConfig.teacherPhone) {
      toast.error('أدخل رقم هاتفك أولاً لاستقبال رسالة الاختبار');
      return;
    }
    setWaTesting(true);
    saveWAConfig(waConfig); // save before test
    const ok = await sendWhatsApp(
      normalizePhone(waConfig.teacherPhone),
      WA_TEMPLATES.welcome('مدرس', settings?.teacherName ?? 'أستاذ أحمد')
    );
    setWaTesting(false);
    if (ok) {
      setWaTestSent(true);
      toast.success('✅ تم إرسال رسالة الاختبار على WhatsApp بنجاح!');
      setTimeout(() => setWaTestSent(false), 4000);
    } else {
      toast.error('فشل إرسال رسالة الاختبار — تحقق من البيانات');
    }
  };
  const utils = trpc.useUtils();
  const { user, addUser } = useAuth();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const { data: studentsList } = trpc.students.list.useQuery();

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

  const [logoPreview, setLogoPreview] = useState("https://api.dicebear.com/7.x/shapes/svg?seed=engportal");

  // Add new teacher form (super admin only)
  const [newTeacherForm, setNewTeacherForm] = useState({
    username: "",
    password: "password",
  });

  // Live room settings
  const [liveForm, setLiveForm] = useState({
    liveRoomUrl: "",
    liveRoomTitle: "",
    liveRoomEnabled: false,
  });

  // Check if current user is super-admin / owner
  const isSuperAdmin = user?.role === "superadmin" || user?.role === "admin";

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
    onError: (e: any) => toast.error(e.message),
  });
  const updateWhiteLabel = trpc.settings.updateWhiteLabel.useMutation({
    onSuccess: () => { utils.settings.get.invalidate(); toast.success("تم حفظ هوية المنصة بنجاح"); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSaveTeacher = () => updateSettings.mutate(teacherForm);
  const handleSaveAdmin   = () => updateWhiteLabel.mutate(adminForm);
  const handleSaveLive    = async () => {
    updateSettings.mutate({
      liveRoomUrl:     liveForm.liveRoomUrl,
      liveRoomTitle:   liveForm.liveRoomTitle,
      liveRoomEnabled: liveForm.liveRoomEnabled ? 1 : 0,
    });

    // ── WhatsApp: notify all students when live room is turned ON ───────────
    const waConf = getWAConfig();
    if (waConf.enabled && liveForm.liveRoomEnabled && studentsList) {
      const teacherName   = settings?.teacherName ?? 'الأستاذ';
      const lectureTitle  = liveForm.liveRoomTitle || 'محاضرة مباشرة';
      const lectureLink   = liveForm.liveRoomUrl   || '#';
      const message = WA_TEMPLATES.liveStarted(teacherName, lectureTitle, lectureLink);
      const phones = (studentsList as any[])
        .map((s: any) => s.phone)
        .filter(Boolean)
        .map(normalizePhone);
      if (phones.length > 0) {
        toast.info(`📱 جاري إشعار ${phones.length} طالب ببدء البث...`);
        const { sent, failed } = await sendWhatsAppBulk(phones, message);
        toast.success(`✅ تم إرسال WhatsApp لـ ${sent} طالب${failed > 0 ? ` (${failed} فشل)` : ''}`);
      }
    }
  };

  const handleAddTeacher = () => {
    if (!newTeacherForm.username || !newTeacherForm.password) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    const newTeacherAccount = {
      id: `teacher-${Date.now()}`,
      name: newTeacherForm.username.split('@')[0],
      email: newTeacherForm.username,
      role: "teacher" as const,
      status: "active" as const,
      createdAt: new Date().toISOString(),
      subjects: ["Mathematics", "Science", "English"],
      gradeLevel: 8,
    };
    addUser(newTeacherAccount);
    toast.success(`تم إضافة المعلم (${newTeacherForm.username}) بنجاح بكلمة مرور (${newTeacherForm.password})`);
    setNewTeacherForm({ username: "", password: "password" });
  };

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

        {/* ── White-Label Identity (Super-Admin vs Teacher lock) ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`border-2 ${isSuperAdmin ? 'border-amber-300 bg-amber-50/30' : 'border-border bg-card'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${isSuperAdmin ? 'text-amber-600' : 'text-muted-foreground'}`} />
                  هوية المنصة وشعار المعلم (White Label)
                </CardTitle>
                {isSuperAdmin ? (
                  <Badge variant="outline" className="gap-1 border-green-300 text-green-700 bg-green-50">
                    <Shield className="w-3 h-3" />
                    صلاحية المدير العام (Super Admin)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700 bg-amber-50">
                    <Lock className="w-3 h-3" />
                    للقراءة فقط (مخصص للمدير العام)
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                {isSuperAdmin
                  ? "بصفتك Super Admin، تملك الصلاحية الكاملة لتعديل اسم المعلم، الشعار (Logo)، المادة، والصف الدراسي."
                  : "معلومات الهوية والشعار مخصصة للمدير العام (Super Admin) فقط ولا يمكن تعديلها بواسطة المعلم."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>شعار المنصة (Logo)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  {isSuperAdmin ? (
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={logoPreview}
                        onChange={e => setLogoPreview(e.target.value)}
                        placeholder="رابط الشعار الجديد (Logo URL)"
                        className="text-xs"
                        dir="ltr"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">أدخل رابط صورة الشعار لتعديله في البوابة</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      تعديل الشعار (Logo) مخصص للمدير العام (Super Admin) فقط.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>اسم المعلم</Label>
                <Input
                  value={adminForm.teacherName}
                  onChange={e => setAdminForm(p => ({ ...p, teacherName: e.target.value }))}
                  className="mt-1"
                  disabled={!isSuperAdmin}
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
                    disabled={!isSuperAdmin}
                    placeholder="اللغة الإنجليزية"
                  />
                </div>
                <div>
                  <Label>الصف الدراسي الافتراضي</Label>
                  <Input
                    value={adminForm.gradeLevel}
                    onChange={e => setAdminForm(p => ({ ...p, gradeLevel: e.target.value }))}
                    className="mt-1"
                    disabled={!isSuperAdmin}
                    placeholder="الصف الثالث الثانوي"
                  />
                </div>
              </div>
              {isSuperAdmin ? (
                <Button
                  onClick={handleSaveAdmin}
                  disabled={updateWhiteLabel.isPending}
                  size="sm"
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Save className="w-4 h-4" />
                  حفظ هوية المنصة
                </Button>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>تعديل اسم المعلم والشعار والمادة مغلق. يرجى تسجيل الدخول بحساب Super Admin للتعديل.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Add New Teacher (Super-Admin Only) ── */}
        {isSuperAdmin && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-2 border-primary/40 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-primary">
                    <UserPlus className="w-4 h-4" />
                    إضافة معلم جديد (Add New Teacher)
                  </CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    خاص بالمدير العام
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  يمكن للمدير العام (Super Admin) فقط إنشاء حسابات معلمين جديدة باسم مستخدم وكلمة مرور.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم المستخدم / البريد الإلكتروني</Label>
                    <Input
                      value={newTeacherForm.username}
                      onChange={e => setNewTeacherForm(p => ({ ...p, username: e.target.value }))}
                      className="mt-1"
                      dir="ltr"
                      placeholder="teacher2@engportal.com"
                    />
                  </div>
                  <div>
                    <Label>كلمة المرور الافتراضية</Label>
                    <div className="relative mt-1">
                      <Input
                        value={newTeacherForm.password}
                        onChange={e => setNewTeacherForm(p => ({ ...p, password: e.target.value }))}
                        className="pr-10"
                        dir="ltr"
                      />
                      <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleAddTeacher}
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  إنشاء حساب المعلم
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Teacher-Editable: Bio & Welcome ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
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

        {/* ── WhatsApp Notifications ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50/60 to-emerald-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-green-800">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  إشعارات WhatsApp
                </CardTitle>
                <Badge variant="outline" className="gap-1 border-green-400 text-green-700 bg-green-50 font-medium">
                  {waConfig.enabled ? '🟢 مفعّل' : '⚪ معطّل'}
                </Badge>
              </div>
              <CardDescription className="text-xs text-green-700/80">
                أرسل إشعارات تلقائية للطلاب على WhatsApp عند رفع درس جديد، بدء بث مباشر، أو تأكيد دفعة.
                يعمل عبر خدمة <a href="https://ultramsg.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Ultramsg</a> (مجاني للتجربة).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/70 border border-green-200 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-green-900">تفعيل إشعارات WhatsApp</p>
                  <p className="text-xs text-muted-foreground">سيتم إرسال رسائل تلقائية عند الأحداث المهمة</p>
                </div>
                <Switch
                  checked={waConfig.enabled}
                  onCheckedChange={v => setWaConfig(p => ({ ...p, enabled: v }))}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-green-800">Instance ID (من لوحة Ultramsg)</Label>
                  <Input
                    value={waConfig.instanceId}
                    onChange={e => setWaConfig(p => ({ ...p, instanceId: e.target.value }))}
                    className="mt-1 bg-white/80 border-green-200 focus:border-green-500"
                    dir="ltr"
                    placeholder="instance123456"
                  />
                </div>
                <div>
                  <Label className="text-green-800">Token (من لوحة Ultramsg)</Label>
                  <div className="relative mt-1">
                    <Input
                      type={waTokenVisible ? 'text' : 'password'}
                      value={waConfig.token}
                      onChange={e => setWaConfig(p => ({ ...p, token: e.target.value }))}
                      className="pl-10 bg-white/80 border-green-200 focus:border-green-500"
                      dir="ltr"
                      placeholder="••••••••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setWaTokenVisible(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {waTokenVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-green-800">رقم هاتف المعلم (لاستقبال رسائل الاختبار)</Label>
                  <Input
                    value={waConfig.teacherPhone}
                    onChange={e => setWaConfig(p => ({ ...p, teacherPhone: e.target.value }))}
                    className="mt-1 bg-white/80 border-green-200 focus:border-green-500"
                    dir="ltr"
                    placeholder="01012345678"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">سيُرسل إليه اختبار الاتصال — يُحوّل تلقائيًا للصيغة الدولية</p>
                </div>
              </div>

              {/* Info box */}
              <div className="p-3 bg-green-100/60 border border-green-200 rounded-lg text-xs text-green-800 space-y-1">
                <p className="font-semibold">📋 الإشعارات التلقائية المتاحة:</p>
                <ul className="space-y-0.5 pr-2">
                  <li>📚 رفع درس جديد → إشعار لجميع الطلاب المسجلين</li>
                  <li>🔴 بدء بث مباشر → إشعار فوري لكل الطلاب</li>
                  <li>✅ نتيجة اختبار → إشعار للطالب بنتيجته</li>
                  <li>💳 تأكيد دفعة → إشعار تأكيد للطالب</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleSaveWA}
                  size="sm"
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md"
                >
                  <Save className="w-4 h-4" />
                  حفظ إعدادات WhatsApp
                </Button>
                <Button
                  onClick={handleTestWA}
                  disabled={waTesting}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-green-400 text-green-700 hover:bg-green-50"
                >
                  {waTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : waTestSent ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {waTesting ? 'جاري الإرسال...' : waTestSent ? 'تم الإرسال!' : 'إرسال رسالة اختبار'}
                </Button>
                <a
                  href="https://ultramsg.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-700 underline self-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  فتح لوحة Ultramsg
                </a>
              </div>
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
