import { useState } from "react";
import TeacherLayout from "@/components/portal/TeacherLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, UserCheck, Users, UserPlus, UserX, UserCog, TrendingUp, Phone, School, AlertCircle, GraduationCap } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const GRADE_DISPLAY: Record<string, { ar: string; en: string }> = {
  "الصف الأول الثانوي": { ar: "الصف الأول الثانوي", en: "1st Secondary" },
  "الصف الثاني الثانوي": { ar: "الصف الثاني الثانوي", en: "2nd Secondary" },
  "الصف الثالث الثانوي": { ar: "الصف الثالث الثانوي", en: "3rd Secondary" },
  "الصف الأول الإعدادي": { ar: "الصف الأول الإعدادي", en: "1st Preparatory" },
  "الصف الثاني الإعدادي": { ar: "الصف الثاني الإعدادي", en: "2nd Preparatory" },
  "الصف الثالث الإعدادي": { ar: "الصف الثالث الإعدادي", en: "3rd Preparatory" },
};

export default function TeacherStudents() {
  const utils = trpc.useUtils();
  const { data: students, isLoading } = trpc.students.list.useQuery();
  const { data: units } = trpc.units.list.useQuery();
  const { data: gradeLevels } = trpc.units.gradeLevels.useQuery();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState<number | null>(null);
  const [enrollUnitId, setEnrollUnitId] = useState<string>("");
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [suspendStudentId, setSuspendStudentId] = useState<number | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ nameAr: "", phone: "", parentPhone: "", schoolName: "", gradeLevel: "" });

  const { data: radarData } = trpc.analytics.studentRadar.useQuery(
    { studentId: selectedStudent?.id ?? 0 },
    { enabled: selectedStudent !== null && selectedStudent.id > 0 }
  );
  const { data: historyData } = trpc.analytics.studentResultHistory.useQuery(
    { studentId: selectedStudent?.id ?? 0 },
    { enabled: selectedStudent !== null && selectedStudent.id > 0 }
  );

  const enroll = trpc.students.enroll.useMutation({
    onSuccess: () => { utils.students.list.invalidate(); setEnrollDialog(false); toast.success("تم تسجيل الطالب في الوحدة"); },
    onError: (e: any) => toast.error(e.message),
  });

  const suspend = trpc.students.suspend.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      setSuspendDialog(false);
      setSuspendReason("");
      if (selectedStudent) setSelectedStudent((s: any) => ({ ...s, isActive: false }));
      toast.success("تم تعليق حساب الطالب");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createStudent = trpc.students.create.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      setAddDialog(false);
      setAddForm({ nameAr: "", phone: "", parentPhone: "", schoolName: "", gradeLevel: "" });
      toast.success("تم إضافة الطالب بنجاح");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const activate = trpc.students.activate.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      if (selectedStudent) setSelectedStudent((s: any) => ({ ...s, isActive: true }));
      toast.success("تم تفعيل حساب الطالب");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (students ?? []).filter(
    (s: any) => s.nameAr.includes(search) || s.schoolName?.includes(search) || s.phone?.includes(search)
  );

  const activeCount = (students ?? []).filter((s: any) => s.isActive).length;
  const suspendedCount = (students ?? []).filter((s: any) => !s.isActive).length;

  return (
    <TeacherLayout title="إدارة الطلاب">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "إجمالي الطلاب", value: students?.length ?? 0, color: "text-blue-600 bg-blue-50", icon: Users },
          { label: "نشطون", value: activeCount, color: "text-green-600 bg-green-50", icon: UserCheck },
          { label: "موقوفون", value: suspendedCount, color: "text-red-600 bg-red-50", icon: UserX },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-black">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو المدرسة أو الهاتف..." className="pr-9" />
        </div>
        <Button onClick={() => setAddDialog(true)} className="gap-2 flex-shrink-0">
          <UserPlus className="w-4 h-4" />
          إضافة طالب
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-2 space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>لا يوجد طلاب مطابقون للبحث</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((student: any, i: number) => (
                <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedStudent?.id === student.id ? "border-primary ring-1 ring-primary/50 shadow-md" : ""} ${!student.isActive ? "opacity-60" : ""}`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${student.isActive ? "bg-primary/10" : "bg-muted"}`}>
                          <span className={`font-bold text-sm ${student.isActive ? "text-primary" : "text-muted-foreground"}`}>
                            {student.nameAr.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{student.nameAr}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.schoolName ?? "—"} {student.gradeLevel && `· ${GRADE_DISPLAY[student.gradeLevel]?.ar ?? student.gradeLevel}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={student.isActive ? "default" : "destructive"} className="text-xs">
                          {student.isActive ? "نشط" : "موقوف"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2"
                            onClick={e => { e.stopPropagation(); setEnrollStudentId(student.id); setEnrollUnitId(""); setEnrollDialog(true); }}>
                            <UserCheck className="w-3 h-3" />
                          </Button>
                          {student.isActive ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={e => { e.stopPropagation(); setSuspendStudentId(student.id); setSuspendDialog(true); }}>
                              <UserX className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2 text-green-600 border-green-200 hover:bg-green-50"
                              onClick={e => { e.stopPropagation(); activate.mutate({ studentId: student.id }); }}>
                              <UserCheck className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Student Detail Panel */}
        <div className="lg:sticky lg:top-4 self-start">
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div key={selectedStudent.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${selectedStudent.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {selectedStudent.nameAr.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{selectedStudent.nameAr}</CardTitle>
                        <Badge variant={selectedStudent.isActive ? "default" : "destructive"} className="text-xs mt-1">
                          {selectedStudent.isActive ? "نشط" : "موقوف"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {selectedStudent.schoolName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <School className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{selectedStudent.schoolName}</span>
                        </div>
                      )}
                      {selectedStudent.gradeLevel && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{GRADE_DISPLAY[selectedStudent.gradeLevel]?.ar ?? selectedStudent.gradeLevel}</span>
                        </div>
                      )}
                      {selectedStudent.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span dir="ltr">{selectedStudent.phone}</span>
                        </div>
                      )}
                      {selectedStudent.parentPhone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <UserCog className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>ولي الأمر: <span dir="ltr">{selectedStudent.parentPhone}</span></span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Performance Trend Line */}
                    {historyData && historyData.length > 1 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          منحنى الأداء عبر الزمن
                        </p>
                        <ResponsiveContainer width="100%" height={130}>
                          <LineChart data={historyData as any[]}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                            <XAxis dataKey="date" tick={{ fontSize: 8 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} unit="%" width={28} />
                            <Tooltip formatter={(v: any) => [`${v}%`, "الدرجة"]} contentStyle={{ fontFamily: "Cairo, sans-serif", direction: "rtl", fontSize: 11 }} />
                            <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="score" stroke="var(--color-primary, #1e40af)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {historyData && historyData.length === 1 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-muted-foreground">اختبار واحد فقط — يحتاج المزيد من البيانات للمنحنى</p>
                        <p className="text-lg font-bold text-primary mt-1">{(historyData as any[])[0]?.score}%</p>
                      </div>
                    )}
                    {historyData && historyData.length === 0 && (
                      <div className="text-center py-2 text-muted-foreground">
                        <AlertCircle className="w-5 h-5 mx-auto mb-1 opacity-40" />
                        <p className="text-xs">لم يجرِ أي اختبار بعد</p>
                      </div>
                    )}

                    {/* Radar Chart */}
                    {radarData && radarData.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">أداء الاختبارات بالوحدات</p>
                        <ResponsiveContainer width="100%" height={160}>
                          <RadarChart data={radarData as any[]}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="unit" tick={{ fontSize: 9 }} />
                            <Radar name="الدرجة" dataKey="score" fill="var(--color-primary, #1e40af)" fillOpacity={0.25} stroke="var(--color-primary, #1e40af)" strokeWidth={2} />
                            <Tooltip formatter={(v: any) => [`${v}%`, "الدرجة"]} contentStyle={{ fontFamily: "Cairo, sans-serif", direction: "rtl" }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Actions */}
                    <Separator />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs"
                        onClick={() => { setEnrollStudentId(selectedStudent.id); setEnrollUnitId(""); setEnrollDialog(true); }}>
                        <UserCheck className="w-3 h-3" />
                        تسجيل في وحدة
                      </Button>
                      {selectedStudent.isActive ? (
                        <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => { setSuspendStudentId(selectedStudent.id); setSuspendDialog(true); }}>
                          <UserX className="w-3 h-3" />
                          تعليق
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => activate.mutate({ studentId: selectedStudent.id })} disabled={activate.isPending}>
                          <UserCheck className="w-3 h-3" />
                          تفعيل
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">اختر طالباً لعرض تفاصيله ومنحنى أدائه</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enroll Dialog */}
      <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle>تسجيل في وحدة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>اختر الوحدة</Label>
              <Select value={enrollUnitId} onValueChange={setEnrollUnitId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="اختر وحدة..." /></SelectTrigger>
                <SelectContent>
                  {(units ?? []).map((u: any) => <SelectItem key={u.id} value={u.id.toString()}>{u.titleAr}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEnrollDialog(false)}>إلغاء</Button>
            <Button onClick={() => {
              if (!enrollStudentId || !enrollUnitId) { toast.error("يرجى اختيار الوحدة"); return; }
              enroll.mutate({ studentId: enrollStudentId, unitId: Number(enrollUnitId) });
            }} disabled={enroll.isPending}>
              {enroll.isPending ? "جاري التسجيل..." : "تسجيل"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle className="text-red-700">تعليق حساب الطالب</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">هل أنت متأكد من تعليق هذا الحساب؟ لن يتمكن الطالب من الدخول للمنصة.</p>
            <div>
              <Label>سبب التعليق (اختياري)</Label>
              <Input className="mt-1" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="مثال: عدم السداد" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setSuspendDialog(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => {
              if (!suspendStudentId) return;
              suspend.mutate({ studentId: suspendStudentId, reason: suspendReason });
            }} disabled={suspend.isPending}>
              {suspend.isPending ? "جاري التعليق..." : "تعليق الحساب"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle>إضافة طالب جديد</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>الاسم بالعربية <span className="text-red-500">*</span></Label>
              <Input className="mt-1" value={addForm.nameAr} onChange={e => setAddForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: أحمد محمد" />
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input className="mt-1" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="01xxxxxxxxx" dir="ltr" />
            </div>
            <div>
              <Label>هاتف ولي الأمر</Label>
              <Input className="mt-1" value={addForm.parentPhone} onChange={e => setAddForm(f => ({ ...f, parentPhone: e.target.value }))} placeholder="01xxxxxxxxx" dir="ltr" />
            </div>
            <div>
              <Label>المدرسة</Label>
              <Input className="mt-1" value={addForm.schoolName} onChange={e => setAddForm(f => ({ ...f, schoolName: e.target.value }))} placeholder="اسم المدرسة" />
            </div>
            <div>
              <Label>الصف الدراسي <span className="text-red-500">*</span></Label>
              <Select value={addForm.gradeLevel} onValueChange={(v) => setAddForm(f => ({ ...f, gradeLevel: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر الصف الدراسي..." />
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
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAddDialog(false)}>إلغاء</Button>
            <Button onClick={() => {
              if (!addForm.nameAr.trim()) { toast.error("الاسم مطلوب"); return; }
              if (!addForm.gradeLevel) { toast.error("يرجى اختيار الصف الدراسي"); return; }
              createStudent.mutate(addForm);
            }} disabled={createStudent.isPending}>
              {createStudent.isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
