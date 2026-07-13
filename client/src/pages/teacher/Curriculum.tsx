import { useState, useMemo, useRef, useEffect } from "react";
import TeacherLayout from "@/components/portal/TeacherLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  BookOpen, ChevronDown, ChevronUp, Edit, FileText,
  GraduationCap, Link2, Loader2, Paperclip, Plus, Trash2, Video,
} from "lucide-react";
import { getWAConfig, sendWhatsAppBulk, WA_TEMPLATES, normalizePhone } from "@/lib/whatsapp";

const GRADE_OPTIONS = [
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
];

const GRADE_DISPLAY: Record<string, { ar: string; en: string }> = {
  "الصف الأول الثانوي": { ar: "الصف الأول الثانوي", en: "1st Secondary" },
  "الصف الثاني الثانوي": { ar: "الصف الثاني الثانوي", en: "2nd Secondary" },
  "الصف الثالث الثانوي": { ar: "الصف الثالث الثانوي", en: "3rd Secondary" },
  "الصف الأول الإعدادي": { ar: "الصف الأول الإعدادي", en: "1st Preparatory" },
  "الصف الثاني الإعدادي": { ar: "الصف الثاني الإعدادي", en: "2nd Preparatory" },
  "الصف الثالث الإعدادي": { ar: "الصف الثالث الإعدادي", en: "3rd Preparatory" },
};

const UNIT_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);
const LESSON_NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);

// ─── Translations Object ──────────────────────────────────────────────────────
const tCurriculum = {
  ar: {
    pageTitle: "المنهج الدراسي",
    unitsSummary: (units: number, grades: number) => `${units} وحدة في ${grades} صف دراسي`,
    addNewUnit: "إضافة وحدة جديدة",
    addNewLesson: "درس جديد",
    allStages: "الكل",
    unitLabel: "الوحدة",
    lessonLabel: "الدرس",
    materials: "المواد",
    noLessons: "لا توجد دروس بعد",
    noUnits: "لا توجد وحدات لهذا الصف بعد",
    livePass: "🔴 بث مباشر",
    livePassBanner: "باقة حصص مباشرة",
    livePassDesc: "الطلاب المشتركون يصلون لصفحة البث المباشر مباشرةً عند الضغط على هذه الوحدة.",
    livePassHint: "لتفعيل البث، اذهب إلى الإعدادات → غرفة البث وفعّل البث مع رابط الاجتماع.",
    draft: "مسودة",
    published: "منشور",
    edit: "تعديل",
    delete: "حذف",
    confirmDeleteUnit: "هل تريد حذف هذه الوحدة؟ سيتم حذف جميع الدروس والمواد المرفقة بها أيضاً.",
    confirmDeleteLesson: "هل تريد حذف هذا الدرس بجميع المواد المرفقة به؟",
    confirmDeleteMaterial: "هل تريد حذف هذه المادة المرفقة؟",
    dialogCancel: "إلغاء",
    dialogSave: "حفظ التعديلات",
    dialogCreate: "إنشاء",
    dialogCreateUnit: "إنشاء الوحدة",
    dialogCreateLesson: "إنشاء الدرس",
    dialogEditUnit: "تعديل الوحدة",
    dialogEditLesson: "تعديل الدرس",
    gradeLevelLabel: "الصف الدراسي *",
    unitNumberLabel: "رقم الوحدة *",
    unitTitleArLabel: "عنوان الوحدة بالعربية *",
    unitTitleEnLabel: "عنوان الوحدة بالإنجليزية *",
    unitDescriptionLabel: "وصف الوحدة (اختياري)",
    priceLabel: "السعر (جنيه)",
    livePassToggleLabel: "باقة حصص مباشرة",
    livePassToggleDesc: "الطلاب المشتركون يصلون لصفحة البث المباشر بدلاً من الدروس",
    publishToggleLabel: "نشر للطلاب فور الحفظ",
    lessonNumberLabel: "رقم الدرس *",
    lessonTitleArLabel: "عنوان الدرس بالعربية *",
    lessonTitleEnLabel: "عنوان الدرس بالإنجليزية *",
    videoUrlLabel: "رابط الفيديو الرئيسي (اختياري)",
    videoUrlHint: "يمكنك إضافة مواد إضافية (فيديوهات وملفات PDF) من لوحة المواد بعد حفظ الدرس",
    durationLabel: "المدة (دقيقة)",
    freePreviewLabel: "معاينة مجانية (بدون اشتراك)",
    materialsTitle: "المواد المرفقة",
    noMaterials: "لا توجد مواد مرفقة بعد",
    addVideoTitle: "إضافة رابط فيديو",
    videoTitlePlaceholder: "عنوان الفيديو بالعربية",
    videoUrlPlaceholder: "https://www.youtube.com/embed/...",
    uploadPdfTitle: "رفع ملف PDF",
    pdfTitlePlaceholder: "عنوان الملف بالعربية",
    pdfUploadBtn: "اختر ملف PDF",
    loading: "جاري التحميل...",
    successAddVideo: "تم إضافة الفيديو",
    successUploadPdf: "تم رفع ملف PDF",
    successDeleteMaterial: "تم حذف المادة المرفقة",
    successCreateUnit: "تم إنشاء الوحدة بنجاح",
    successUpdateUnit: "تم تحديث الوحدة",
    successDeleteUnit: "تم حذف الوحدة",
    successCreateLesson: "تم إنشاء الدرس",
    successUpdateLesson: "تم تحديث الدرس",
    successDeleteLesson: "تم حذف الدرس",
    validationTitleAr: "يرجى كتابة عنوان الوحدة",
    validationTitleArLesson: "يرجى كتابة عنوان الدرس",
    validationPdfTitle: "أدخل عنوان الملف أولاً",
    openBtn: "فتح",
    confirmTitle: "تأكيد الحذف",
  },
  en: {
    pageTitle: "Curriculum",
    unitsSummary: (units: number, grades: number) => `${units} Unit${units !== 1 ? "s" : ""} in ${grades} Grade${grades !== 1 ? "s" : ""}`,
    addNewUnit: "Add New Unit",
    addNewLesson: "New Lesson",
    allStages: "All",
    unitLabel: "Unit",
    lessonLabel: "Lesson",
    materials: "Materials",
    noLessons: "No lessons yet",
    noUnits: "No units for this grade level yet",
    livePass: "🔴 Live Stream",
    livePassBanner: "Live Session Package",
    livePassDesc: "Enrolled students access the live stream page directly when clicking this unit.",
    livePassHint: "To enable streaming, go to Settings → Live Room and activate it with a meeting link.",
    draft: "Draft",
    published: "Published",
    edit: "Edit",
    delete: "Delete",
    confirmDeleteUnit: "Are you sure you want to delete this unit? This will also delete all its lessons and materials.",
    confirmDeleteLesson: "Are you sure you want to delete this lesson and all its materials?",
    confirmDeleteMaterial: "Are you sure you want to delete this material?",
    dialogCancel: "Cancel",
    dialogSave: "Save Changes",
    dialogCreate: "Create",
    dialogCreateUnit: "Create Unit",
    dialogCreateLesson: "Create Lesson",
    dialogEditUnit: "Edit Unit",
    dialogEditLesson: "Edit Lesson",
    gradeLevelLabel: "Grade Level *",
    unitNumberLabel: "Unit Number *",
    unitTitleArLabel: "Unit Title (Arabic) *",
    unitTitleEnLabel: "Unit Title (English) *",
    unitDescriptionLabel: "Unit Description (Optional)",
    priceLabel: "Price (EGP)",
    livePassToggleLabel: "Live Session Package",
    livePassToggleDesc: "Enrolled students go to the live stream page instead of lessons",
    publishToggleLabel: "Publish to students upon saving",
    lessonNumberLabel: "Lesson Number *",
    lessonTitleArLabel: "Lesson Title (Arabic) *",
    lessonTitleEnLabel: "Lesson Title (English) *",
    videoUrlLabel: "Main Video URL (Optional Shortcut)",
    videoUrlHint: "You can add extra materials (videos and PDFs) from the materials panel after saving the lesson",
    durationLabel: "Duration (Minutes)",
    freePreviewLabel: "Free Preview (No subscription required)",
    materialsTitle: "Attached Materials",
    noMaterials: "No materials attached yet",
    addVideoTitle: "Add Video Link",
    videoTitlePlaceholder: "Video Title (Arabic)",
    videoUrlPlaceholder: "https://www.youtube.com/embed/...",
    uploadPdfTitle: "Upload PDF File",
    pdfTitlePlaceholder: "PDF File Title (Arabic)",
    pdfUploadBtn: "Choose PDF File",
    loading: "Loading...",
    successAddVideo: "Video added successfully",
    successUploadPdf: "PDF uploaded successfully",
    successDeleteMaterial: "Material deleted successfully",
    successCreateUnit: "Unit created successfully",
    successUpdateUnit: "Unit updated successfully",
    successDeleteUnit: "Unit deleted successfully",
    successCreateLesson: "Lesson created successfully",
    successUpdateLesson: "Lesson updated successfully",
    successDeleteLesson: "Lesson deleted successfully",
    validationTitleAr: "Please enter the unit title",
    validationTitleArLesson: "Please enter the lesson title",
    validationPdfTitle: "Please enter the PDF title first",
    openBtn: "Open",
    confirmTitle: "Confirm Deletion",
  }
};

// ─── Materials Panel ──────────────────────────────────────────────────────────
function MaterialsPanel({ lessonId, lang, curr }: { lessonId: number; lang: string; curr: any }) {
  const utils = trpc.useUtils();
  const { data: materials, isLoading } = trpc.materials.list.useQuery({ lessonId });

  const [videoForm, setVideoForm] = useState({ titleAr: "", url: "" });
  const [pdfForm, setPdfForm] = useState({ titleAr: "" });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addVideo = trpc.materials.addVideo.useMutation({
    onSuccess: () => {
      utils.materials.list.invalidate({ lessonId });
      setVideoForm({ titleAr: "", url: "" });
      toast.success(curr.successAddVideo);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const uploadPdf = trpc.materials.uploadPdf.useMutation({
    onSuccess: () => {
      utils.materials.list.invalidate({ lessonId });
      setPdfForm({ titleAr: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(curr.successUploadPdf);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMaterial = trpc.materials.delete.useMutation({
    onSuccess: () => {
      utils.materials.list.invalidate({ lessonId });
      setDeleteTarget(null);
      toast.success(curr.successDeleteMaterial);
    },
    onError: (e: any) => toast.error(e.message),
  });

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!pdfForm.titleAr.trim()) { toast.error(curr.validationPdfTitle); return; }
    setUploadingPdf(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      await uploadPdf.mutateAsync({ lessonId, titleAr: pdfForm.titleAr, fileBase64: base64, mimeType: file.type });
      setUploadingPdf(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="border-t border-dashed border-border/85 mt-2 pt-3 space-y-4">
      {/* Existing materials list */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> {curr.loading}</div>
      ) : materials && materials.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground mb-1">{curr.materialsTitle}</p>
          {materials.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border/60 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {m.type === "video" ? (
                  <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                )}
                <span className="truncate">{m.titleAr}</span>
                <a href={m.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs shrink-0 flex items-center gap-0.5 ml-2 mr-2">
                  <Link2 className="w-3 h-3" />
                  {curr.openBtn}
                </a>
              </div>
              <Button
                variant="ghost" size="icon" className="w-6 h-6 text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => setDeleteTarget(m.id)}
                disabled={deleteMaterial.isPending}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{curr.noMaterials}</p>
      )}

      <Separator />

      {/* Add Video URL */}
      <div className="space-y-2">
        <p className="text-xs font-semibold flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-blue-500" /> {curr.addVideoTitle}</p>
        <div className="grid grid-cols-1 gap-2">
          <Input
            placeholder={curr.videoTitlePlaceholder}
            value={videoForm.titleAr}
            onChange={(e) => setVideoForm(p => ({ ...p, titleAr: e.target.value }))}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Input
              placeholder={curr.videoUrlPlaceholder}
              value={videoForm.url}
              onChange={(e) => setVideoForm(p => ({ ...p, url: e.target.value }))}
              className="h-8 text-sm ltr flex-1"
              dir="ltr"
            />
            <Button
              size="sm" className="h-8 px-3 shrink-0"
              disabled={!videoForm.titleAr || !videoForm.url || addVideo.isPending}
              onClick={() => addVideo.mutate({ lessonId, titleAr: videoForm.titleAr, url: videoForm.url })}
            >
              {addVideo.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Upload PDF */}
      <div className="space-y-2">
        <p className="text-xs font-semibold flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5 text-red-500" /> {curr.uploadPdfTitle}</p>
        <div className="grid grid-cols-1 gap-2">
          <Input
            placeholder={curr.pdfTitlePlaceholder}
            value={pdfForm.titleAr}
            onChange={(e) => setPdfForm(p => ({ ...p, titleAr: e.target.value }))}
            className="h-8 text-sm"
          />
          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className={`text-xs text-muted-foreground file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary cursor-pointer flex-1 ${
                lang === "ar" ? "file:ml-3" : "file:mr-3"
              }`}
              onChange={handlePdfUpload}
              disabled={uploadingPdf || uploadPdf.isPending}
            />
            {(uploadingPdf || uploadPdf.isPending) && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />}
          </div>
        </div>
      </div>

      {/* Material Delete Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{curr.confirmTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">{curr.confirmDeleteMaterial}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>{curr.dialogCancel}</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteTarget && deleteMaterial.mutate({ id: deleteTarget })} disabled={deleteMaterial.isPending}>
              {deleteMaterial.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 ml-2" />}
              {curr.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeacherCurriculum() {
  const utils = trpc.useUtils();
  const { data: units, isLoading } = trpc.units.list.useQuery();
  const { data: gradeLevels } = trpc.units.gradeLevels.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: studentsList } = trpc.students.list.useQuery();
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [expandedMaterials, setExpandedMaterials] = useState<number | null>(null);
  const [unitDialog, setUnitDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [activeGrade, setActiveGrade] = useState<string>("all");
  
  // Custom delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    type: "unit" | "lesson";
    id: number;
  }>({
    open: false,
    type: "unit",
    id: 0,
  });

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem("lang") || "ar");
    };
    window.addEventListener("storage", handleLangChange);
    window.addEventListener("langChange", handleLangChange);
    return () => {
      window.removeEventListener("storage", handleLangChange);
      window.removeEventListener("langChange", handleLangChange);
    };
  }, []);

  const curr = tCurriculum[lang as "ar" | "en"] || tCurriculum.ar;

  const { data: lessons } = trpc.lessons.listByUnit.useQuery(
    { unitId: expandedUnit! },
    { enabled: expandedUnit !== null }
  );

  const createUnit = trpc.units.create.useMutation({
    onSuccess: () => {
      utils.units.list.invalidate();
      utils.units.gradeLevels.invalidate();
      setUnitDialog(false);
      toast.success(curr.successCreateUnit);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateUnit = trpc.units.update.useMutation({
    onSuccess: () => {
      utils.units.list.invalidate();
      utils.units.gradeLevels.invalidate();
      setUnitDialog(false);
      toast.success(curr.successUpdateUnit);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteUnit = trpc.units.delete.useMutation({
    onSuccess: () => {
      utils.units.list.invalidate();
      utils.units.gradeLevels.invalidate();
      setConfirmDelete(p => ({ ...p, open: false }));
      toast.success(curr.successDeleteUnit);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createLesson = trpc.lessons.create.useMutation({
    onSuccess: async (newLesson: any) => {
      utils.lessons.listByUnit.invalidate();
      setLessonDialog(false);
      toast.success(curr.successCreateLesson);

      // ── WhatsApp notification to all students ──────────────────────────
      const waConf = getWAConfig();
      if (waConf.enabled && studentsList && units) {
        const unit = units.find((u: any) => u.id === selectedUnitId);
        const unitTitle  = unit?.titleAr ?? unit?.titleEn ?? 'وحدة';
        const lessonTitle = newLesson?.titleAr ?? newLesson?.titleEn ?? 'درس جديد';
        const teacherName = settings?.teacherName ?? 'الأستاذ';
        const message = WA_TEMPLATES.newLesson(teacherName, unitTitle, lessonTitle);
        const phones = (studentsList as any[])
          .map((s: any) => s.phone)
          .filter(Boolean)
          .map(normalizePhone);
        if (phones.length > 0) {
          toast.info(`📱 جاري إرسال إشعار WhatsApp لـ ${phones.length} طالب...`);
          const { sent, failed } = await sendWhatsAppBulk(phones, message);
          toast.success(`✅ تم إرسال WhatsApp لـ ${sent} طالب${failed > 0 ? ` (${failed} فشل)` : ''}`);
        }
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateLesson = trpc.lessons.update.useMutation({
    onSuccess: () => {
      utils.lessons.listByUnit.invalidate();
      setLessonDialog(false);
      toast.success(curr.successUpdateLesson);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteLesson = trpc.lessons.delete.useMutation({
    onSuccess: () => {
      utils.lessons.listByUnit.invalidate();
      setConfirmDelete(p => ({ ...p, open: false }));
      toast.success(curr.successDeleteLesson);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [unitForm, setUnitForm] = useState({
    titleAr: "",
    titleEn: "",
    description: "",
    gradeLevel: "الصف الثالث الثانوي",
    price: "150",
    orderIndex: 1,
    isPublished: false,
    isLivePass: false,
  });

  const [lessonForm, setLessonForm] = useState({
    titleAr: "",
    titleEn: "",
    contentType: "video" as "video" | "pdf" | "text",
    videoUrl: "",
    isFreePreview: false,
    orderIndex: 1,
    durationMinutes: 45,
  });

  const filteredUnits = useMemo(() => {
    if (!units) return [];
    if (activeGrade === "all") return units;
    return units.filter((u: any) => (u as any).gradeLevel === activeGrade);
  }, [units, activeGrade]);

  const allGrades = useMemo(() => gradeLevels ?? [], [gradeLevels]);

  function openNewUnit() {
    setEditingUnit(null);
    setUnitForm({
      titleAr: "",
      titleEn: "",
      description: "",
      gradeLevel: activeGrade !== "all" ? activeGrade : "الصف الثالث الثانوي",
      price: "150",
      orderIndex: (units?.length ?? 0) + 1,
      isPublished: false,
      isLivePass: false,
    });
    setUnitDialog(true);
  }

  function openEditUnit(unit: any) {
    setEditingUnit(unit);
    setUnitForm({
      titleAr: unit.titleAr,
      titleEn: unit.titleEn ?? "",
      description: unit.description ?? "",
      gradeLevel: (unit as any).gradeLevel ?? "الصف الثالث الثانوي",
      price: String(unit.price ?? 150),
      orderIndex: unit.orderIndex,
      isPublished: unit.isPublished,
      isLivePass: (unit as any).isLivePass ?? false,
    });
    setUnitDialog(true);
  }

  function openNewLesson(unitId: number) {
    setEditingLesson(null);
    setSelectedUnitId(unitId);
    setLessonForm({ titleAr: "", titleEn: "", contentType: "video", videoUrl: "", isFreePreview: false, orderIndex: (lessons?.length ?? 0) + 1, durationMinutes: 45 });
    setLessonDialog(true);
  }

  function openEditLesson(lesson: any) {
    setEditingLesson(lesson);
    setSelectedUnitId(lesson.unitId);
    setLessonForm({ titleAr: lesson.titleAr, titleEn: lesson.titleEn ?? "", contentType: lesson.contentType, videoUrl: lesson.videoUrl ?? "", isFreePreview: lesson.isFreePreview, orderIndex: lesson.orderIndex, durationMinutes: lesson.durationMinutes ?? 45 });
    setLessonDialog(true);
  }

  function submitUnit() {
    if (!unitForm.titleAr.trim()) { toast.error(curr.validationTitleAr); return; }
    const titleEn = unitForm.titleEn.trim() || `Unit ${unitForm.orderIndex}`;
    if (editingUnit) {
      updateUnit.mutate({ id: editingUnit.id, ...unitForm, titleEn });
    } else {
      createUnit.mutate({ ...unitForm, titleEn });
    }
  }

  function submitLesson() {
    if (!lessonForm.titleAr.trim()) { toast.error(curr.validationTitleArLesson); return; }
    const titleEn = lessonForm.titleEn.trim() || `Lesson ${lessonForm.orderIndex}`;
    if (editingLesson) {
      updateLesson.mutate({ id: editingLesson.id, ...lessonForm, titleEn });
    } else {
      createLesson.mutate({ unitId: selectedUnitId!, ...lessonForm, titleEn });
    }
  }

  const gradeColors: Record<string, string> = {
    "الصف الأول الثانوي": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "الصف الثاني الثانوي": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "الصف الثالث الثانوي": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "الصف الأول الإعدادي": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "الصف الثاني الإعدادي": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "الصف الثالث الإعدادي": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  };

  return (
    <TeacherLayout title={curr.pageTitle}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">
            {curr.unitsSummary(units?.length ?? 0, allGrades.length)}
          </span>
        </div>
        <Button onClick={openNewUnit} className="gap-2 self-start sm:self-auto shadow-sm">
          <Plus className="w-4 h-4" />
          {curr.addNewUnit}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grade level filter combo box */}
          <div className="flex items-center gap-3 bg-muted/40 dark:bg-muted/10 p-3 rounded-xl border border-border/40 w-fit">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {lang === "ar" ? "تصفية حسب الصف:" : "Filter by Grade:"}
            </span>
            <Select value={activeGrade} onValueChange={setActiveGrade}>
              <SelectTrigger className="w-56 h-9 rounded-lg text-xs bg-background">
                <SelectValue placeholder={lang === "ar" ? "اختر الصف الدراسي..." : "Choose grade level..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  {lang === "ar" ? "الكل" : "All"} ({units?.length ?? 0})
                </SelectItem>
                {allGrades.map((grade: string) => (
                  <SelectItem key={grade} value={grade} className="text-xs">
                    {lang === "ar" ? (GRADE_DISPLAY[grade]?.ar ?? grade) : (GRADE_DISPLAY[grade]?.en ?? grade)} ({units?.filter((u: any) => u.gradeLevel === grade).length ?? 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredUnits.map((unit: any) => (
              <Card key={unit.id} className="overflow-hidden border-border/60 hover:shadow-md transition-shadow">
                {/* Unit Row */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors"
                  onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">{unit.orderIndex}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate">{lang === "en" ? (unit.titleEn || unit.titleAr) : unit.titleAr}</p>
                        {(unit as any).isLivePass && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                            {curr.livePass}
                          </span>
                        )}
                        {(unit as any).gradeLevel && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${gradeColors[(unit as any).gradeLevel] ?? "bg-gray-100 text-gray-700"}`}>
                            {lang === "ar" ? (GRADE_DISPLAY[(unit as any).gradeLevel]?.ar ?? (unit as any).gradeLevel) : (GRADE_DISPLAY[(unit as any).gradeLevel]?.en ?? (unit as any).gradeLevel)}
                          </span>
                        )}
                      </div>
                      {lang === "ar" && unit.titleEn && <p className="text-xs text-muted-foreground ltr text-right mt-0.5" dir="ltr">{unit.titleEn}</p>}
                      {lang === "en" && unit.titleAr && <p className="text-xs text-muted-foreground mt-0.5">{unit.titleAr}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2 mr-2">
                    <Badge variant={unit.isPublished ? "default" : "secondary"} className="text-xs hidden sm:inline-flex">
                      {unit.isPublished ? curr.published : curr.draft}
                    </Badge>
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); openEditUnit(unit); }}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, type: "unit", id: unit.id }); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    {expandedUnit === unit.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Lessons Panel or Live Pass Info */}
                {expandedUnit === unit.id && (
                  <div className="border-t border-border bg-muted/20 dark:bg-muted/5 p-4">
                    {(unit as any).isLivePass ? (
                      <div className="text-center py-6 space-y-2 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
                          <span className="text-2xl">🔴</span>
                        </div>
                        <p className="text-sm font-semibold">{curr.livePassBanner}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{curr.livePassDesc}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{curr.livePassHint}</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-semibold text-muted-foreground">{curr.lessonLabel}s</p>
                          <Button size="sm" variant="outline" className="gap-1 h-7 text-xs shadow-sm" onClick={() => openNewLesson(unit.id)}>
                            <Plus className="w-3 h-3" />
                            {curr.addNewLesson}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {lessons?.map((lesson: any) => (
                            <div key={lesson.id} className="bg-card rounded-lg border border-border overflow-hidden">
                              {/* Lesson Row */}
                              <div className="flex items-center justify-between px-3 py-2.5 flex-wrap sm:flex-nowrap gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-muted-foreground">{lesson.orderIndex}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{lang === "en" ? (lesson.titleEn || lesson.titleAr) : lesson.titleAr}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {lesson.durationMinutes ? <p className="text-xs text-muted-foreground">{lesson.durationMinutes} {lang === "ar" ? "دقيقة" : "mins"}</p> : null}
                                      {lang === "ar" && lesson.titleEn && <p className="text-[10px] text-muted-foreground ltr" dir="ltr">{lesson.titleEn}</p>}
                                      {lang === "en" && lesson.titleAr && <p className="text-[10px] text-muted-foreground">{lesson.titleAr}</p>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                                  {lesson.isFreePreview && <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200">{lang === "ar" ? "مجاني" : "Free"}</Badge>}
                                  {/* Materials toggle */}
                                  <Button
                                    variant="ghost" size="sm"
                                    className={`h-6 px-2 text-xs gap-1 ${expandedMaterials === lesson.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                                    onClick={() => setExpandedMaterials(expandedMaterials === lesson.id ? null : lesson.id)}
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    {curr.materials}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => openEditLesson(lesson)}>
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="w-6 h-6 text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete({ open: true, type: "lesson", id: lesson.id })}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              {/* Materials Panel (inline) */}
                              {expandedMaterials === lesson.id && (
                                <div className="px-3 pb-3">
                                  <MaterialsPanel lessonId={lesson.id} lang={lang} curr={curr} />
                                </div>
                              )}
                            </div>
                          ))}
                          {!lessons?.length && <p className="text-xs text-muted-foreground text-center py-4">{curr.noLessons}</p>}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            ))}
            {!filteredUnits.length && (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="mb-3">{curr.noUnits}</p>
                <Button variant="outline" size="sm" onClick={openNewUnit}>{curr.addNewUnit}</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Unit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={unitDialog} onOpenChange={setUnitDialog}>
        <DialogContent className="max-w-md w-full px-4 sm:px-6" dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{editingUnit ? curr.dialogEditUnit : curr.dialogCreateUnit}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
            {/* Grade Level */}
            <div>
              <Label>{curr.gradeLevelLabel}</Label>
              <Select value={unitForm.gradeLevel} onValueChange={(v) => setUnitForm(p => ({ ...p, gradeLevel: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={lang === "ar" ? "اختر الصف الدراسي" : "Select grade level"} />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map(g => (
                    <SelectItem key={g} value={g}>
                      {lang === "ar" ? (GRADE_DISPLAY[g]?.ar ?? g) : (GRADE_DISPLAY[g]?.en ?? g)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit Number Dropdown */}
            <div>
              <Label>{curr.unitNumberLabel}</Label>
              <Select
                value={String(unitForm.orderIndex)}
                onValueChange={(v) => setUnitForm(p => ({ ...p, orderIndex: Number(v) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={lang === "ar" ? "اختر رقم الوحدة" : "Select unit number"} />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_NUMBERS.map(n => (
                    <SelectItem key={n} value={String(n)}>
                      {lang === "ar" ? `الوحدة ${n}` : `Unit ${n}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Arabic Title */}
            <div>
              <Label>{curr.unitTitleArLabel}</Label>
              <Input
                value={unitForm.titleAr}
                onChange={e => setUnitForm(p => ({ ...p, titleAr: e.target.value }))}
                placeholder="مثال: داخل عالم الرعاية"
                className="mt-1 text-right"
                dir="rtl"
              />
            </div>

            {/* English Title */}
            <div>
              <Label>{curr.unitTitleEnLabel}</Label>
              <Input
                value={unitForm.titleEn}
                onChange={e => setUnitForm(p => ({ ...p, titleEn: e.target.value }))}
                placeholder="e.g. Inside the World of Care"
                className="mt-1 text-left"
                dir="ltr"
              />
            </div>

            {/* Description */}
            <div>
              <Label>{curr.unitDescriptionLabel}</Label>
              <Textarea value={unitForm.description} onChange={e => setUnitForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} />
            </div>

            {/* Price */}
            <div>
              <Label>{curr.priceLabel}</Label>
              <Input type="number" value={unitForm.price} onChange={e => setUnitForm(p => ({ ...p, price: e.target.value }))} className="mt-1" />
            </div>

            {/* Live Pass toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/35">
              <Switch
                checked={unitForm.isLivePass}
                onCheckedChange={v => setUnitForm(p => ({ ...p, isLivePass: v }))}
              />
              <div>
                <Label className="text-red-700 dark:text-red-400 font-semibold">{curr.livePassToggleLabel}</Label>
                <p className="text-xs text-red-500 dark:text-red-300/80">{curr.livePassToggleDesc}</p>
              </div>
            </div>
            {/* Published toggle */}
            <div className="flex items-center gap-2">
              <Switch checked={unitForm.isPublished} onCheckedChange={v => setUnitForm(p => ({ ...p, isPublished: v }))} />
              <Label>{curr.publishToggleLabel}</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUnitDialog(false)}>{curr.dialogCancel}</Button>
            <Button onClick={submitUnit} disabled={createUnit.isPending || updateUnit.isPending}>
              {(createUnit.isPending || updateUnit.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 ml-2" />}
              {editingUnit ? curr.dialogSave : curr.dialogCreate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Lesson Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent className="max-w-md w-full px-4 sm:px-6" dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{editingLesson ? curr.dialogEditLesson : curr.dialogCreateLesson}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
            {/* Lesson Number Dropdown */}
            <div>
              <Label>{curr.lessonNumberLabel}</Label>
              <Select
                value={String(lessonForm.orderIndex)}
                onValueChange={(v) => setLessonForm(p => ({ ...p, orderIndex: Number(v) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={lang === "ar" ? "اختر رقم الدرس" : "Select lesson number"} />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_NUMBERS.map(n => (
                    <SelectItem key={n} value={String(n)}>
                      {lang === "ar" ? `الدرس ${n}` : `Lesson ${n}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Arabic Title */}
            <div>
              <Label>{curr.lessonTitleArLabel}</Label>
              <Input
                value={lessonForm.titleAr}
                onChange={e => setLessonForm(p => ({ ...p, titleAr: e.target.value }))}
                placeholder="مثال: القراءة - يومي في حياة ممرضة"
                className="mt-1 text-right"
                dir="rtl"
              />
            </div>

            {/* English Title */}
            <div>
              <Label>{curr.lessonTitleEnLabel}</Label>
              <Input
                value={lessonForm.titleEn}
                onChange={e => setLessonForm(p => ({ ...p, titleEn: e.target.value }))}
                placeholder="e.g. Reading - A day in the life of a nurse"
                className="mt-1 text-left"
                dir="ltr"
              />
            </div>

            {/* Main video URL */}
            <div>
              <Label>{curr.videoUrlLabel}</Label>
              <Input
                value={lessonForm.videoUrl}
                onChange={e => setLessonForm(p => ({ ...p, videoUrl: e.target.value }))}
                placeholder={curr.videoUrlPlaceholder}
                className="mt-1 ltr text-left"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{curr.videoUrlHint}</p>
            </div>

            {/* Duration */}
            <div>
              <Label>{curr.durationLabel}</Label>
              <Input type="number" value={lessonForm.durationMinutes} onChange={e => setLessonForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))} className="mt-1" />
            </div>

            {/* Free preview toggle */}
            <div className="flex items-center gap-2">
              <Switch checked={lessonForm.isFreePreview} onCheckedChange={v => setLessonForm(p => ({ ...p, isFreePreview: v }))} />
              <Label>{curr.freePreviewLabel}</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLessonDialog(false)}>{curr.dialogCancel}</Button>
            <Button onClick={submitLesson} disabled={createLesson.isPending || updateLesson.isPending}>
              {(createLesson.isPending || updateLesson.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 ml-2" />}
              {editingLesson ? curr.dialogSave : curr.dialogCreate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Units/Lessons Deletion Confirm Dialog */}
      <Dialog open={confirmDelete.open} onOpenChange={(open) => !open && setConfirmDelete(p => ({ ...p, open: false }))}>
        <DialogContent className="max-w-sm w-full px-4 sm:px-6" dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{curr.confirmTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2 leading-relaxed">
            {confirmDelete.type === "unit" ? curr.confirmDeleteUnit : curr.confirmDeleteLesson}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(p => ({ ...p, open: false }))}>
              {curr.dialogCancel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirmDelete.type === "unit") deleteUnit.mutate({ id: confirmDelete.id });
                if (confirmDelete.type === "lesson") deleteLesson.mutate({ id: confirmDelete.id });
              }}
              disabled={deleteUnit.isPending || deleteLesson.isPending}
            >
              {(deleteUnit.isPending || deleteLesson.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 ml-2" />}
              {curr.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
