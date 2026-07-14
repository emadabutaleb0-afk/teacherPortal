import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  BookOpen, Plus, FileVideo, FileText, UploadCloud, 
  Video, File, ArrowUpRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { Unit, Lesson, LessonMaterial } from '@/lib/mockData';

interface TeacherCurriculumProps {
  user: any;
}

export default function TeacherCurriculum({ user }: TeacherCurriculumProps) {
  const teacherSubjects = user?.subjects || [];
  const teacherGrade = user?.gradeLevel;

  // Selected filters
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    return teacherSubjects.length > 0 ? teacherSubjects[0] : 'Mathematics';
  });
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return teacherGrade?.toString() || '8';
  });

  // Core Data States
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [materials, setMaterials] = useState<Record<string, LessonMaterial[]>>({});
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);

  // Accordion toggle states
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  // Add Dialog States
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);

  // New Item Input States
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [activeUnitId, setActiveUnitId] = useState('');
  
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonOrder, setNewLessonOrder] = useState('1');
  const [activeLessonId, setActiveLessonId] = useState('');

  const [newMaterialType, setNewMaterialType] = useState<'video' | 'document'>('video');
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [newMaterialDetails, setNewMaterialDetails] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Sync state with user profile once loaded
  useEffect(() => {
    if (user) {
      if (teacherSubjects.length > 0) {
        setSelectedSubject(teacherSubjects[0]);
      }
      if (teacherGrade !== undefined) {
        setSelectedGrade(teacherGrade.toString());
      }
    }
  }, [user]);

  // Fetch Curriculum when Subject/Grade changes
  useEffect(() => {
    if (user) {
      fetchCurriculum();
    }
  }, [selectedSubject, selectedGrade]);

  const fetchCurriculum = async () => {
    setIsLoadingCurriculum(true);
    try {
      // Get Units
      const unitsRes = await fetch(`/api/units?subject=${selectedSubject}&gradeLevel=${selectedGrade}`);
      const unitsData = await unitsRes.json();
      setUnits(unitsData);

      // Expand all units by default
      const defaultExpandedUnits: Record<string, boolean> = {};
      unitsData.forEach((u: Unit) => {
        defaultExpandedUnits[u.id] = true;
      });
      setExpandedUnits(defaultExpandedUnits);

      // Get Lessons for all units
      const allLessons: Lesson[] = [];
      const materialsMap: Record<string, LessonMaterial[]> = {};

      for (const unit of unitsData) {
        const lessonsRes = await fetch(`/api/lessons?unitId=${unit.id}`);
        const lessonsData = await lessonsRes.json();
        allLessons.push(...lessonsData);

        for (const lesson of lessonsData) {
          const matRes = await fetch(`/api/lessons/${lesson.id}/materials`);
          const matData = await matRes.json();
          materialsMap[lesson.id] = matData;
        }
      }

      setLessons(allLessons);
      setMaterials(materialsMap);
    } catch (error) {
      console.error('Error fetching curriculum data:', error);
      toast.error('Failed to load curriculum hierarchy');
    } finally {
      setIsLoadingCurriculum(false);
    }
  };

  // Add Unit
  const handleAddUnit = async () => {
    if (!newUnitName.trim() || !newUnitDesc.trim()) {
      toast.error('Please fill in all unit fields');
      return;
    }

    const unitId = `unit-${Date.now()}`;
    const newUnit: Unit = {
      id: unitId,
      subject: selectedSubject,
      gradeLevel: parseInt(selectedGrade),
      name: newUnitName.trim(),
      description: newUnitDesc.trim()
    };

    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Unit "${newUnitName}" created successfully!`);
        setNewUnitName('');
        setNewUnitDesc('');
        setIsAddUnitOpen(false);
        fetchCurriculum();
      } else {
        toast.error(data.error || 'Failed to create unit');
      }
    } catch (error) {
      console.error('Error creating unit:', error);
      toast.error('Failed to connect to the server');
    }
  };

  // Add Lesson
  const handleAddLesson = async () => {
    if (!newLessonName.trim() || !newLessonDesc.trim() || !newLessonOrder.trim()) {
      toast.error('Please fill in all lesson fields');
      return;
    }

    const lessonId = `lesson-${Date.now()}`;
    const newLesson: Lesson = {
      id: lessonId,
      unitId: activeUnitId,
      name: newLessonName.trim(),
      description: newLessonDesc.trim(),
      orderNum: parseInt(newLessonOrder) || 1
    };

    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Lesson "${newLessonName}" created successfully!`);
        setNewLessonName('');
        setNewLessonDesc('');
        setNewLessonOrder('1');
        setIsAddLessonOpen(false);
        fetchCurriculum();
      } else {
        toast.error(data.error || 'Failed to create lesson');
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to connect to the server');
    }
  };

  // Handle File Upload & Convert to Base64
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Max size is 10MB.');
      return;
    }

    setIsUploadingFile(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewMaterialUrl(base64String);
      if (!newMaterialTitle.trim()) {
        setNewMaterialTitle(file.name);
      }
      setIsUploadingFile(false);
      toast.success(`File "${file.name}" loaded successfully.`);
    };
    reader.onerror = () => {
      setIsUploadingFile(false);
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  // Add Material
  const handleAddMaterial = async () => {
    if (!newMaterialTitle.trim() || !newMaterialUrl.trim()) {
      toast.error('Please enter a title and URL for the material');
      return;
    }

    const matId = `material-${Date.now()}`;
    const newMaterial = {
      id: matId,
      type: newMaterialType,
      title: newMaterialTitle.trim(),
      url: newMaterialUrl.trim(),
      details: newMaterialDetails.trim()
    };

    try {
      const res = await fetch(`/api/lessons/${activeLessonId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Material "${newMaterialTitle}" uploaded!`);
        setNewMaterialTitle('');
        setNewMaterialUrl('');
        setNewMaterialDetails('');
        setIsAddMaterialOpen(false);
        fetchCurriculum();
      } else {
        toast.error(data.error || 'Failed to upload material');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to connect to the server');
    }
  };

  const toggleUnit = (id: string) => {
    setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLesson = (id: string) => {
    setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="border border-border bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Academic Curriculum Scope
            </CardTitle>
            <CardDescription>Filter curriculum by subject and grade level to construct units and lessons.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Selector */}
            <div className="min-w-[150px]">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {teacherSubjects.map((sub: string) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade Selector */}
            <div className="min-w-[120px]">
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={`Grade ${teacherGrade}`} />
                </SelectTrigger>
                <SelectContent>
                  {teacherGrade !== undefined && (
                    <SelectItem value={teacherGrade.toString()}>Grade {teacherGrade}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Add Unit Button */}
            <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5 h-9 bg-primary hover:opacity-90 font-semibold text-white shadow-sm transition-all duration-300">
                  <Plus className="w-4 h-4" /> Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Unit</DialogTitle>
                  <DialogDescription>
                    Add a unit under {selectedSubject} for Grade {selectedGrade}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="unit-name">Unit Title</Label>
                    <Input 
                      id="unit-name" 
                      placeholder="e.g. Quadratic Functions" 
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit-desc">Description</Label>
                    <Textarea 
                      id="unit-desc" 
                      placeholder="Brief summary of unit goals..." 
                      value={newUnitDesc}
                      onChange={(e) => setNewUnitDesc(e.target.value)}
                    />
                  </div>
                  <Button className="w-full mt-2 bg-gradient-to-r from-primary to-accent font-semibold text-white" onClick={handleAddUnit}>Create Unit</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoadingCurriculum ? (
            <div className="py-12 text-center text-muted-foreground animate-pulse font-semibold">
              Loading curriculum structure...
            </div>
          ) : units.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/5">
              <BookOpen className="w-12 h-12 text-muted-foreground/45 mx-auto mb-3" />
              <p className="text-lg font-semibold text-muted-foreground mb-1">No units found</p>
              <p className="text-sm text-muted-foreground mb-4">Click "Add Unit" to start mapping the curriculum for this subject.</p>
              <Button onClick={() => setIsAddUnitOpen(true)} className="bg-primary hover:opacity-90 text-white font-semibold">Create First Unit</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {units.map((unit) => {
                const unitLessons = lessons.filter(l => l.unitId === unit.id);
                const isExpanded = expandedUnits[unit.id];

                return (
                  <div key={unit.id} className="border border-border/80 rounded-xl overflow-hidden bg-card/60 backdrop-blur shadow-sm">
                    {/* Unit Title Header */}
                    <div 
                      className="flex items-center justify-between p-4 bg-secondary/35 border-b border-border/60 cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => toggleUnit(unit.id)}
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base md:text-lg text-foreground">{unit.name}</h3>
                          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/50">
                            {unitLessons.length} Lessons
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">{unit.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Create Lesson inside Unit */}
                        <Dialog open={isAddLessonOpen && activeUnitId === unit.id} onOpenChange={(open) => {
                          setIsAddLessonOpen(open);
                          if (open) setActiveUnitId(unit.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 gap-1 text-xs border-primary/20 text-primary hover:bg-primary/5 bg-background font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveUnitId(unit.id);
                                setIsAddLessonOpen(true);
                              }}
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Lesson
                            </Button>
                          </DialogTrigger>
                          <DialogContent onClick={(e) => e.stopPropagation()}>
                            <DialogHeader>
                              <DialogTitle>Add New Lesson</DialogTitle>
                              <DialogDescription>
                                Create a lesson inside the unit: <strong>{unit.name}</strong>.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <Label htmlFor="lesson-name">Lesson Title</Label>
                                <Input 
                                  id="lesson-name" 
                                  placeholder="e.g. Graphing Intercepts" 
                                  value={newLessonName}
                                  onChange={(e) => setNewLessonName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lesson-desc">Description</Label>
                                <Textarea 
                                  id="lesson-desc" 
                                  placeholder="Summarize the core topics taught..." 
                                  value={newLessonDesc}
                                  onChange={(e) => setNewLessonDesc(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lesson-order">Order Number</Label>
                                <Input 
                                  id="lesson-order" 
                                  type="number" 
                                  value={newLessonOrder}
                                  onChange={(e) => setNewLessonOrder(e.target.value)}
                                  className="w-24"
                                />
                              </div>
                              <Button className="w-full mt-2 bg-gradient-to-r from-primary to-accent font-semibold text-white" onClick={handleAddLesson}>Create Lesson</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Unit Lessons Accordion Content */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 bg-secondary/10 border-t border-border/55">
                        {unitLessons.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-6 italic bg-background/50 border border-dashed rounded-lg">No lessons added to this unit yet.</p>
                        ) : (
                          unitLessons.map((lesson) => {
                            const lessonMats = materials[lesson.id] || [];
                            const isLessonExpanded = expandedLessons[lesson.id];

                            return (
                              <div key={lesson.id} className="border border-border/60 rounded-xl bg-background/55 overflow-hidden shadow-sm">
                                {/* Lesson Header Row */}
                                <div 
                                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-secondary/20 transition-colors"
                                  onClick={() => toggleLesson(lesson.id)}
                                >
                                  <div>
                                    <p className="font-semibold text-sm text-foreground">
                                      Lesson {lesson.orderNum}: {lesson.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{lesson.description}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {/* Add Material Dialog */}
                                    <Dialog open={isAddMaterialOpen && activeLessonId === lesson.id} onOpenChange={(open) => {
                                      setIsAddMaterialOpen(open);
                                      if (open) setActiveLessonId(lesson.id);
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-8 text-xs gap-1 border border-border/80 text-muted-foreground hover:text-primary hover:bg-primary/5 font-semibold bg-background"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveLessonId(lesson.id);
                                            setIsAddMaterialOpen(true);
                                          }}
                                        >
                                          <UploadCloud className="w-3.5 h-3.5" /> Upload Material
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent onClick={(e) => e.stopPropagation()}>
                                        <DialogHeader>
                                          <DialogTitle>Attach Media Material</DialogTitle>
                                          <DialogDescription>
                                            Add videos or document links for: <strong>{lesson.name}</strong>.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-2">
                                          <div className="space-y-2">
                                            <Label>Material Type</Label>
                                            <Select value={newMaterialType} onValueChange={(val: any) => setNewMaterialType(val)}>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="video">🎥 Video URL / Embed</SelectItem>
                                                <SelectItem value="document">📄 PDF / Document File</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="mat-title">Title</Label>
                                            <Input 
                                              id="mat-title" 
                                              placeholder={newMaterialType === 'video' ? "e.g. Concept Walkthrough Video" : "e.g. Reference Guide PDF"} 
                                              value={newMaterialTitle}
                                              onChange={(e) => setNewMaterialTitle(e.target.value)}
                                            />
                                          </div>

                                          {newMaterialType === 'document' && (
                                            <div className="space-y-2">
                                              <Label>Upload File (Optional)</Label>
                                              {newMaterialUrl.startsWith('data:') ? (
                                                <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-3 flex items-center justify-between">
                                                  <div className="flex items-center gap-2 min-w-0">
                                                    <File className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                      <p className="text-xs font-semibold truncate text-emerald-600 dark:text-emerald-400">
                                                        {newMaterialTitle || 'Uploaded Document'}
                                                      </p>
                                                      <p className="text-[10px] text-muted-foreground">Document file loaded successfully</p>
                                                    </div>
                                                  </div>
                                                  <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-xs border-emerald-200/50 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-950/20"
                                                    onClick={() => {
                                                      setNewMaterialUrl('');
                                                      setNewMaterialTitle('');
                                                    }}
                                                  >
                                                    Change File
                                                  </Button>
                                                </div>
                                              ) : (
                                                <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer relative bg-secondary/5">
                                                  <input 
                                                    type="file" 
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                                                    onChange={handleFileChange}
                                                    disabled={isUploadingFile}
                                                  />
                                                  {isUploadingFile ? (
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                  ) : (
                                                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                                                  )}
                                                  <div className="text-center">
                                                    <span className="text-xs font-semibold text-primary">Click to browse</span>
                                                    <span className="text-xs text-muted-foreground"> or drag file here</span>
                                                  </div>
                                                  <p className="text-[10px] text-muted-foreground">PDF, Word, Excel, PPT, Image (max 10MB)</p>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {(!newMaterialUrl.startsWith('data:') || newMaterialType === 'video') && (
                                            <div className="space-y-2">
                                              <Label htmlFor="mat-url">
                                                {newMaterialType === 'video' ? 'Video URL / Embed Link' : 'Or Document Link / URL'}
                                              </Label>
                                              <Input 
                                                id="mat-url" 
                                                placeholder={newMaterialType === 'video' ? "e.g. https://www.youtube.com/embed/..." : "e.g. https://drive.google.com/..."} 
                                                value={newMaterialUrl}
                                                onChange={(e) => setNewMaterialUrl(e.target.value)}
                                              />
                                            </div>
                                          )}

                                          <div className="space-y-2">
                                            <Label htmlFor="mat-details">Details</Label>
                                            <Input 
                                              id="mat-details" 
                                              placeholder="Brief instruction for students..." 
                                              value={newMaterialDetails}
                                              onChange={(e) => setNewMaterialDetails(e.target.value)}
                                            />
                                          </div>
                                          <Button className="w-full mt-2 bg-gradient-to-r from-primary to-accent font-semibold text-white" onClick={handleAddMaterial} disabled={isUploadingFile}>
                                            {isUploadingFile ? 'Uploading file...' : 'Upload'}
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    {isLessonExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                  </div>
                                </div>

                                {/* Lesson Materials expanded */}
                                {isLessonExpanded && (
                                  <div className="p-3 border-t border-border/55 bg-secondary/10 grid sm:grid-cols-2 gap-3">
                                    {lessonMats.length === 0 ? (
                                      <p className="text-xs text-muted-foreground col-span-2 text-center py-3 italic bg-background/35 rounded-lg border border-border/40">No files or videos linked to this lesson yet.</p>
                                    ) : (
                                      lessonMats.map((mat) => (
                                        <div key={mat.id} className="p-3 border border-border/80 rounded-xl bg-background flex items-start gap-3 hover:shadow-md transition-shadow duration-300">
                                          <div className="mt-0.5">
                                            {mat.type === 'video' ? (
                                              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                                                <Video className="w-4 h-4" />
                                              </div>
                                            ) : (
                                              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                                <File className="w-4 h-4" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-xs text-foreground truncate">{mat.title}</p>
                                            <p className="text-[10px] text-muted-foreground line-clamp-1">{mat.details || 'No details provided'}</p>
                                            <a 
                                              href={mat.url} 
                                              target={mat.url.startsWith('data:') ? undefined : "_blank"} 
                                              download={mat.url.startsWith('data:') ? mat.title : undefined}
                                              rel="noopener noreferrer" 
                                              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:underline mt-1.5"
                                            >
                                              {mat.url.startsWith('data:') ? 'Download File' : 'Open Link'} <ArrowUpRight className="w-3 h-3" />
                                            </a>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
