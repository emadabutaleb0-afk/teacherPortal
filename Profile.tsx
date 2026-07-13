import { useState } from "react";
import StudentLayout from "./StudentLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, School, Edit2, Save, X, Award, BookOpen, CheckCircle, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const GRADE_DISPLAY: Record<string, { ar: string; en: string }> = {
  "الصف الأول الثانوي": { ar: "الصف الأول الثانوي", en: "1st Secondary" },
  "الصف الثاني الثانوي": { ar: "الصف الثاني الثانوي", en: "2nd Secondary" },
  "الصف الثالث الثانوي": { ar: "الصف الثالث الثانوي", en: "3rd Secondary" },
  "الصف الأول الإعدادي": { ar: "الصف الأول الإعدادي", en: "1st Preparatory" },
  "الصف الثاني الإعدادي": { ar: "الصف الثاني الإعدادي", en: "2nd Preparatory" },
  "الصف الثالث الإعدادي": { ar: "الصف الثالث الإعدادي", en: "3rd Preparatory" },
};

export default function StudentProfile() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.students.getMyProfile.useQuery();
  const { data: gradeLevels } = trpc.units.gradeLevels.useQuery();
  const { data: myResults } = trpc.testTaking.myResults.useQuery();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nameAr: "", phone: "", parentPhone: "", schoolName: "", gradeLevel: "" });

  const updateProfile = trpc.students.updateMyProfile.useMutation({
    onSuccess: () => {
      utils.students.getMyProfile.invalidate();
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setEditing(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  function startEdit() {
    setForm({
      nameAr: profile?.nameAr ?? user?.name ?? "",
      phone: profile?.phone ?? "",
      parentPhone: profile?.parentPhone ?? "",
      schoolName: profile?.schoolName ?? "",
      gradeLevel: (profile as any)?.gradeLevel ?? "",
    });
    setEditing(true);
  }

  const totalTests = myResults?.length ?? 0;
  const passedTests = myResults?.filter((r: any) => r.passed).length ?? 0;
  const avgScore = totalTests > 0
    ? Math.round(myResults!.reduce((s: number, r: any) => s + Number(r.percentage), 0) / totalTests)
    : 0;

  const stats = [
    { label: "الاختبارات المكتملة", value: totalTests, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: "الاختبارات الناجحة", value: passedTests, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "متوسط الدرجات", value: `${avgScore}%`, icon: Award, color: "text-amber-600 bg-amber-50" },
  ];

  if (isLoading) {
    return (
      <StudentLayout title="ملفي الشخصي">
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="ملفي الشخصي">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar & Name Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-l from-blue-600 to-indigo-700" />
            <CardContent className="pt-0 pb-6">
              <div className="flex items-end gap-4 -mt-10 mb-4">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                    {(profile?.nameAr ?? user?.name ?? "ط").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-foreground">{profile?.nameAr ?? user?.name ?? "طالب"}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="mr-auto pb-1">
                  <Badge variant={profile?.isActive !== false ? "default" : "destructive"}>
                    {profile?.isActive !== false ? "نشط" : "موقوف"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <Card key={i} className="text-center">
              <CardContent className="pt-4 pb-4">
                <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                البيانات الشخصية
              </CardTitle>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={startEdit} className="gap-2">
                  <Edit2 className="w-3 h-3" />
                  تعديل
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => {
                    if (!form.nameAr.trim()) { toast.error("يرجى إدخال الاسم"); return; }
                    if (!form.gradeLevel) { toast.error("يرجى اختيار الصف الدراسي"); return; }
                    updateProfile.mutate(form);
                  }} disabled={updateProfile.isPending} className="gap-2">
                    <Save className="w-3 h-3" />
                    حفظ
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-2">
                    <X className="w-3 h-3" />
                    إلغاء
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>الاسم بالعربية</Label>
                    <Input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="الاسم الكامل" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01xxxxxxxxx" />
                    </div>
                    <div className="space-y-2">
                      <Label>هاتف ولي الأمر</Label>
                      <Input value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} placeholder="01xxxxxxxxx" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>اسم المدرسة</Label>
                    <Input value={form.schoolName} onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))} placeholder="اسم المدرسة" />
                  </div>
                  <div className="space-y-2">
                    <Label>الصف الدراسي</Label>
                    <Select value={form.gradeLevel} onValueChange={(v) => setForm(f => ({ ...f, gradeLevel: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر صفك الدراسي..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(gradeLevels && gradeLevels.length > 0 ? gradeLevels : Object.keys(GRADE_DISPLAY)).map((g: string) => (
                          <SelectItem key={g} value={g}>
                            {GRADE_DISPLAY[g]?.ar ?? g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {[
                    { icon: User, label: "الاسم", value: profile?.nameAr ?? user?.name ?? "—" },
                    { icon: GraduationCap, label: "الصف الدراسي", value: (profile as any)?.gradeLevel ? (GRADE_DISPLAY[(profile as any).gradeLevel]?.ar ?? (profile as any).gradeLevel) : "—" },
                    { icon: Phone, label: "الهاتف", value: profile?.phone ?? "—" },
                    { icon: Phone, label: "هاتف ولي الأمر", value: profile?.parentPhone ?? "—" },
                    { icon: School, label: "المدرسة", value: profile?.schoolName ?? "—" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className="font-medium text-sm">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {!profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 pb-4 text-center text-sm text-amber-800">
                لم يتم إنشاء ملفك الشخصي بعد. اضغط على "تعديل" لإضافة بياناتك.
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </StudentLayout>
  );
}
