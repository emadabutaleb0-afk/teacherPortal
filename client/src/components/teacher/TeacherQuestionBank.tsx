import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, Trash2, HelpCircle, Download, AlertCircle, CheckCircle, Upload, Brain
} from 'lucide-react';
import { Question } from '@/lib/mockData';
import AIQuestionGenerator from '../../pages/AIQuestionGenerator';

interface ImportedQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'trueFalse';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  subject: string;
  gradeLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  errors?: string[];
  isDuplicate?: boolean;
}

interface TeacherQuestionBankProps {
  user: any;
}

export default function TeacherQuestionBank({ user }: TeacherQuestionBankProps) {
  const teacherSubjects = user?.subjects || [];
  const teacherGrade = user?.gradeLevel;

  // Question List State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Search/Filters States
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionFilterSubject, setQuestionFilterSubject] = useState('All');
  const [questionFilterDifficulty, setQuestionFilterDifficulty] = useState('All');
  const [questionFilterType, setQuestionFilterType] = useState('All');

  // Manual Add Form States
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'mcq' | 'trueFalse'>('mcq');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['', '', '', '']);
  const [newQuestionCorrectAns, setNewQuestionCorrectAns] = useState('0');
  const [newQuestionExplanation, setNewQuestionExplanation] = useState('');
  const [newQuestionSubject, setNewQuestionSubject] = useState(() => {
    return teacherSubjects.length > 0 ? teacherSubjects[0] : 'Mathematics';
  });
  const [newQuestionGrade, setNewQuestionGrade] = useState(() => {
    return teacherGrade?.toString() || '8';
  });
  const [newQuestionDifficulty, setNewQuestionDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newQuestionWeight, setNewQuestionWeight] = useState('1.00');

  // Bulk Import States
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkQuestions, setBulkQuestions] = useState<ImportedQuestion[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions from database');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Filter questions matching scope & filters
  const questionBankQuestions = questions.filter(q => {
    if (!teacherSubjects.includes(q.subject)) return false;
    if (q.gradeLevel !== teacherGrade) return false;

    if (questionFilterSubject !== 'All' && q.subject !== questionFilterSubject) return false;
    if (questionFilterDifficulty !== 'All' && q.difficulty !== questionFilterDifficulty) return false;
    if (questionFilterType !== 'All' && q.type !== questionFilterType) return false;

    if (questionSearch.trim()) {
      const query = questionSearch.toLowerCase();
      const textMatch = q.text.toLowerCase().includes(query);
      const explanationMatch = q.explanation.toLowerCase().includes(query);
      return textMatch || explanationMatch;
    }

    return true;
  });

  // Add Question Manually
  const handleAddQuestionManually = async () => {
    if (!newQuestionText.trim() || !newQuestionExplanation.trim()) {
      toast.error('Please fill in question text and explanation');
      return;
    }

    const cleanOptions = newQuestionType === 'mcq'
      ? newQuestionOptions.map(o => o.trim()).filter(o => o !== '')
      : undefined;

    if (newQuestionType === 'mcq') {
      if (!cleanOptions || cleanOptions.length < 2) {
        toast.error('An MCQ must have at least 2 non-empty options');
        return;
      }
    }

    let cleanCorrectAnswer: string | number = newQuestionCorrectAns;
    if (newQuestionType === 'mcq') {
      const idx = parseInt(newQuestionCorrectAns);
      if (isNaN(idx) || idx < 0 || idx >= cleanOptions!.length) {
        toast.error('Please select a valid correct answer option');
        return;
      }
      cleanCorrectAnswer = idx;
    } else {
      const val = newQuestionCorrectAns.toLowerCase();
      if (val !== 'true' && val !== 'false') {
        toast.error('For True/False questions, the correct answer must be "true" or "false"');
        return;
      }
      cleanCorrectAnswer = val;
    }

    const questionId = `q-gen-${Date.now()}`;
    const newQ = {
      id: questionId,
      text: newQuestionText.trim(),
      type: newQuestionType,
      options: cleanOptions,
      correctAnswer: cleanCorrectAnswer,
      explanation: newQuestionExplanation.trim(),
      subject: newQuestionSubject,
      gradeLevel: parseInt(newQuestionGrade),
      difficulty: newQuestionDifficulty,
      weight: parseFloat(newQuestionWeight) || 1.00
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Question added successfully! 📂');
        setNewQuestionText('');
        setNewQuestionExplanation('');
        setNewQuestionOptions(['', '', '', '']);
        setNewQuestionCorrectAns('0');
        setNewQuestionWeight('1.00');
        setIsAddQuestionOpen(false);
        fetchQuestions();
      } else {
        toast.error(data.error || 'Failed to add question');
      }
    } catch (e) {
      console.error(e);
      toast.error('Connection failure while adding question');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Question deleted successfully! 🗑️');
        fetchQuestions();
      } else {
        toast.error(data.error || 'Failed to delete question');
      }
    } catch (e) {
      console.error(e);
      toast.error('Connection failure while deleting question');
    }
  };

  // CSV Parser
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const validateQuestion = (question: any, index: number): ImportedQuestion => {
    const errors: string[] = [];
    const id = `import-${Date.now()}-${index}`;

    if (!question.text) errors.push('Question text is required');
    if (!question.type || !['mcq', 'trueFalse'].includes(question.type)) {
      errors.push('Type must be "mcq" or "trueFalse"');
    }
    if (!question.correctAnswer) errors.push('Correct answer is required');
    if (!question.explanation) errors.push('Explanation is required');
    
    if (!question.subject) {
      errors.push('Subject is required');
    } else if (!teacherSubjects.includes(question.subject)) {
      errors.push(`Subject "${question.subject}" is not in your assigned subjects list: ${teacherSubjects.join(', ')}`);
    }

    if (!question.gradeLevel || isNaN(parseInt(question.gradeLevel))) {
      errors.push('Grade level must be a number');
    } else if (parseInt(question.gradeLevel) !== teacherGrade) {
      errors.push(`Grade level ${question.gradeLevel} does not match your assigned grade level (${teacherGrade})`);
    }

    if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty)) {
      errors.push('Difficulty must be "easy", "medium", or "hard"');
    }

    if (question.type === 'mcq') {
      if (!question.options) {
        errors.push('MCQ must have options (pipe-separated)');
      } else {
        const optionsArray = question.options.split('|').map((o: string) => o.trim());
        if (optionsArray.length < 2) {
          errors.push('MCQ must have at least 2 options');
        }
        
        const isNumericIndex = !isNaN(parseInt(question.correctAnswer)) && 
                               parseInt(question.correctAnswer) >= 0 && 
                               parseInt(question.correctAnswer) < optionsArray.length;
        if (!optionsArray.includes(question.correctAnswer) && !isNumericIndex) {
          errors.push('Correct answer must be one of the options or a valid choice index (0, 1, 2...)');
        }
      }
    } else if (question.type === 'trueFalse') {
      const lowerAns = question.correctAnswer.toString().toLowerCase();
      if (lowerAns !== 'true' && lowerAns !== 'false') {
        errors.push('True/False answer must be "true" or "false"');
      }
    }

    return {
      id,
      text: question.text || '',
      type: question.type || 'mcq',
      options: question.type === 'mcq' && question.options ? question.options.split('|').map((o: string) => o.trim()) : undefined,
      correctAnswer: question.type === 'mcq' && !isNaN(parseInt(question.correctAnswer)) ? parseInt(question.correctAnswer) : question.correctAnswer,
      explanation: question.explanation || '',
      subject: question.subject || '',
      gradeLevel: parseInt(question.gradeLevel) || 0,
      difficulty: question.difficulty || 'easy',
      errors: errors.length > 0 ? errors : undefined,
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split(/\r?\n/).slice(1); // Skip header
        const parsedQuestions: ImportedQuestion[] = [];
        const errors: string[] = [];

        lines.forEach((line, index) => {
          if (!line.trim()) return;

          const fields = parseCSVLine(line);

          if (fields.length < 8) {
            errors.push(`Row ${index + 2}: Invalid number of columns (expected at least 8 fields)`);
            return;
          }

          const question = {
            text: fields[0],
            type: fields[1],
            options: fields[2],
            correctAnswer: fields[3],
            explanation: fields[4],
            subject: fields[5],
            gradeLevel: fields[6],
            difficulty: fields[7],
          };

          const validated = validateQuestion(question, index);
          parsedQuestions.push(validated);
        });

        const uniqueTexts = new Set<string>();
        parsedQuestions.forEach(q => {
          if (uniqueTexts.has(q.text)) {
            q.isDuplicate = true;
            errors.push(`Duplicate question in file: "${q.text.substring(0, 40)}..."`);
          }
          uniqueTexts.add(q.text);
        });

        setBulkQuestions(parsedQuestions);
        setValidationErrors(errors);
        setImportStep('preview');
        toast.info('File parsed! Check the validation results below.');
      } catch (error) {
        toast.error('Error parsing CSV file. Please check the format.');
        setValidationErrors(['Error parsing CSV file. Please ensure it matches the template format.']);
      }
    };

    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const defSubject = teacherSubjects.length > 0 ? teacherSubjects[0] : 'Mathematics';
    const defGrade = teacherGrade || 8;

    const templateHeader = 'text,type,options,correctAnswer,explanation,subject,gradeLevel,difficulty\n';
    const row1 = `"Solve for x: 3x - 7 = 14","mcq","x = 5|x = 7|x = 9|x = 3","x = 7","Add 7 to both sides: 3x = 21, then divide by 3: x = 7.","${defSubject}",${defGrade},"easy"\n`;
    const row2 = `"Chlorophyll is the pigment responsible for giving plants their green color.","trueFalse","","true","Chlorophyll is present in plant chloroplasts and absorbs light, reflecting green wavelengths.","${defSubject}",${defGrade},"easy"\n`;
    const row3 = `"Which of the following is a key element of this study?","mcq","Option A|Option B|Option C|Option D","0","Explanation details...","${defSubject}",${defGrade},"medium"`;

    const templateContent = templateHeader + row1 + row2 + row3;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(templateContent));
    element.setAttribute('download', `questions_template_${defSubject}_grade${defGrade}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('CSV template downloaded!');
  };

  const handleBulkImport = async () => {
    const validQuestions = bulkQuestions.filter(q => !q.errors && !q.isDuplicate);
    if (validQuestions.length === 0) {
      toast.error('No valid questions to import.');
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: validQuestions })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Successfully imported ${data.count} questions into the bank! 📂`);
        setImportedCount(validQuestions.length);
        setImportStep('confirm');
        fetchQuestions();
      } else {
        toast.error(data.error || 'Bulk upload failed');
      }
    } catch (error) {
      console.error('Error importing questions:', error);
      toast.error('Connection failure while importing questions');
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetImport = () => {
    setUploadedFile(null);
    setBulkQuestions([]);
    setValidationErrors([]);
    setImportedCount(0);
    setImportStep('upload');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="bg-secondary/45 border border-border/80 p-1 w-full md:w-auto inline-flex h-auto gap-1">
          <TabsTrigger value="manage" className="rounded-md px-4 py-2 font-semibold">
            All Questions
          </TabsTrigger>
          <TabsTrigger value="ai-gen" className="rounded-md px-4 py-2 font-semibold">
            AI Question Generator
          </TabsTrigger>
          <TabsTrigger value="bulk-import" className="rounded-md px-4 py-2 font-semibold">
            Bulk Import
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Questions */}
        <TabsContent value="manage" className="space-y-6 mt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Question Bank Manager</h2>
              <p className="text-muted-foreground text-sm">
                Add, search, filter, and delete questions from the database matching your teaching scope.
              </p>
            </div>

            {/* Add Question Dialog */}
            <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:opacity-90 font-semibold text-white shadow-md transition-all duration-300">
                  <Plus className="w-4 h-4" /> Add Question Manually
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Question</DialogTitle>
                  <DialogDescription>
                    Create a question that will be saved directly into the database for Grade {teacherGrade}.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2 text-sm">
                  <div className="space-y-2">
                    <Label htmlFor="q-text" className="font-semibold">Question Text</Label>
                    <Textarea
                      id="q-text"
                      placeholder="Type the question content here..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Question Type</Label>
                      <Select value={newQuestionType} onValueChange={(val: any) => {
                        setNewQuestionType(val);
                        setNewQuestionCorrectAns('0');
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                          <SelectItem value="trueFalse">True / False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Subject</Label>
                      <Select value={newQuestionSubject} onValueChange={setNewQuestionSubject}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {teacherSubjects.map((sub: string) => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Grade Level</Label>
                      <Select value={newQuestionGrade} disabled>
                        <SelectTrigger>
                          <SelectValue placeholder={`Grade ${teacherGrade}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={teacherGrade?.toString() || '8'}>Grade {teacherGrade}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Difficulty</Label>
                      <Select value={newQuestionDifficulty} onValueChange={(val: any) => setNewQuestionDifficulty(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="q-weight" className="font-semibold">Question Weight</Label>
                      <Input
                        id="q-weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10.0"
                        value={newQuestionWeight}
                        onChange={(e) => setNewQuestionWeight(e.target.value)}
                      />
                    </div>
                  </div>

                  {newQuestionType === 'mcq' && (
                    <div className="space-y-3 p-3 bg-secondary/25 border border-border/60 rounded-xl">
                      <div className="flex justify-between items-center">
                        <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Options List</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs font-bold gap-1 text-primary hover:text-primary"
                          onClick={() => setNewQuestionOptions([...newQuestionOptions, ''])}
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newQuestionOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-muted-foreground w-6">{idx + 1}.</span>
                            <Input
                              placeholder="Enter option text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...newQuestionOptions];
                                updated[idx] = e.target.value;
                                setNewQuestionOptions(updated);
                              }}
                            />
                            {newQuestionOptions.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  const updated = newQuestionOptions.filter((_, i) => i !== idx);
                                  setNewQuestionOptions(updated);
                                  if (parseInt(newQuestionCorrectAns) >= updated.length) {
                                    setNewQuestionCorrectAns('0');
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="font-semibold">Correct Answer</Label>
                    {newQuestionType === 'mcq' ? (
                      <Select value={newQuestionCorrectAns} onValueChange={setNewQuestionCorrectAns}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct option" />
                        </SelectTrigger>
                        <SelectContent>
                          {newQuestionOptions.map((opt, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>
                              Option {idx + 1} {opt.trim() ? `: "${opt.trim().substring(0, 30)}..."` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={newQuestionCorrectAns} onValueChange={setNewQuestionCorrectAns}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="q-explanation" className="font-semibold">Explanation</Label>
                    <Textarea
                      id="q-explanation"
                      placeholder="Describe why this is the correct answer..."
                      value={newQuestionExplanation}
                      onChange={(e) => setNewQuestionExplanation(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleAddQuestionManually} className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-white font-bold h-11">
                    Save Question to Database
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters Card */}
          <Card className="border border-border bg-card/60 backdrop-blur shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Search Text</Label>
                  <Input
                    placeholder="Search question text or explanation..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Subject</Label>
                  <Select value={questionFilterSubject} onValueChange={setQuestionFilterSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Assigned Subjects</SelectItem>
                      {teacherSubjects.map((sub: string) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Difficulty</Label>
                  <Select value={questionFilterDifficulty} onValueChange={setQuestionFilterDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Question Type</Label>
                  <Select value={questionFilterType} onValueChange={setQuestionFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="trueFalse">True / False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question List */}
          <div className="space-y-4">
            {isLoadingQuestions ? (
              <div className="py-12 text-center text-muted-foreground animate-pulse font-semibold">
                Loading question bank...
              </div>
            ) : questionBankQuestions.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/5">
                <HelpCircle className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3" />
                <p className="text-lg font-semibold text-muted-foreground mb-1">No questions match your criteria</p>
                <p className="text-sm text-muted-foreground mb-4">Try clearing filters or add a new question manually.</p>
                <Button variant="outline" onClick={() => {
                  setQuestionSearch('');
                  setQuestionFilterSubject('All');
                  setQuestionFilterDifficulty('All');
                  setQuestionFilterType('All');
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 animate-slide-up">
                {questionBankQuestions.map((q) => (
                  <Card key={q.id} className="hover:shadow-md transition-all duration-300 border border-border/60 bg-card/50 backdrop-blur">
                    <CardContent className="pt-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <p className="font-semibold text-sm md:text-base leading-relaxed text-foreground">{q.text}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">{q.subject}</Badge>
                            <Badge variant="outline" className="text-[10px]">Grade {q.gradeLevel}</Badge>
                            <Badge variant="outline" className={`text-[10px] capitalize ${
                              q.difficulty === 'easy' ? 'text-green-600 bg-green-500/5' : 
                              q.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-500/5' : 
                              'text-red-600 bg-red-500/5'
                            }`}>{q.difficulty}</Badge>
                            <Badge variant="outline" className="text-[10px] uppercase">{q.type === 'mcq' ? 'MCQ' : 'True/False'}</Badge>
                            {q.weight && <Badge variant="outline" className="text-[10px]">Weight: {q.weight}</Badge>}
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                          onClick={() => handleDeleteQuestion(q.id)}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </Button>
                      </div>

                      {q.type === 'mcq' && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = typeof q.correctAnswer === 'number' 
                              ? q.correctAnswer === oIdx 
                              : q.correctAnswer === opt;
                            return (
                              <div 
                                key={oIdx} 
                                className={`px-3 py-2 rounded-lg border transition-colors ${
                                  isCorrect 
                                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-bold' 
                                    : 'border-border/60 bg-muted/10 text-muted-foreground'
                                }`}
                              >
                                {oIdx + 1}. {opt}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'trueFalse' && (
                        <div className="text-xs text-muted-foreground">
                          <span className="text-muted-foreground">Correct Answer: </span>
                          <span className="font-bold text-green-600 dark:text-green-400 capitalize bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
                            {q.correctAnswer.toString()}
                          </span>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="p-3 bg-secondary/35 border border-border/50 rounded-xl text-xs text-muted-foreground">
                          <span className="font-bold text-foreground block mb-0.5">Explanation:</span>
                          <p className="italic leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: AI Question Generator */}
        <TabsContent value="ai-gen" className="mt-4">
          <AIQuestionGenerator embedMode={true} onApproved={fetchQuestions} />
        </TabsContent>

        {/* Tab 3: Bulk Import */}
        <TabsContent value="bulk-import" className="space-y-6 mt-4">
          {importStep === 'upload' && (
            <Card className="border border-border bg-card/65 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle>Upload Questions File</CardTitle>
                <CardDescription>
                  Supported formats: CSV. You can only upload questions matching your teaching profile ({teacherSubjects.join(', ')} - Grade {teacherGrade}).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Download */}
                <div className="bg-secondary/40 border border-border/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Download CSV Template</p>
                      <p className="text-xs text-muted-foreground">Get the structured template file matching your assigned teaching subjects and grade.</p>
                    </div>
                  </div>
                  <Button onClick={downloadCSVTemplate} variant="outline" className="h-9 gap-1.5 self-stretch sm:self-auto font-semibold">
                    <Download className="w-4 h-4" /> Download Template
                  </Button>
                </div>

                {/* File Upload Box */}
                <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300 rounded-xl p-8 text-center bg-muted/10 relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                    <div>
                      <p className="font-bold text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">questions_template.csv up to 10MB</p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {importStep === 'preview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border border-border/80 bg-card/60">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-extrabold text-primary">{bulkQuestions.length}</div>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">Total Parsed</p>
                  </CardContent>
                </Card>
                <Card className="border border-border/80 bg-card/60">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                      {bulkQuestions.filter(q => !q.errors && !q.isDuplicate).length}
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">Valid (Importable)</p>
                  </CardContent>
                </Card>
                <Card className="border border-border/80 bg-card/60">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                      {bulkQuestions.filter(q => q.errors || q.isDuplicate).length}
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">Issues Found</p>
                  </CardContent>
                </Card>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl p-4 flex gap-3 text-xs leading-relaxed">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-bold text-foreground mb-1">Row Validation & Duplicate Warning:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {validationErrors.length > 5 && (
                        <li className="font-semibold text-muted-foreground">... and {validationErrors.length - 5} more issues</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <Tabs defaultValue="valid" className="space-y-4">
                <TabsList className="bg-secondary/40 border border-border p-1 w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-auto gap-1">
                  <TabsTrigger value="valid" className="text-xs font-semibold">
                    Valid ({bulkQuestions.filter(q => !q.errors && !q.isDuplicate).length})
                  </TabsTrigger>
                  <TabsTrigger value="invalid" className="text-xs font-semibold">
                    Invalid ({bulkQuestions.filter(q => q.errors).length})
                  </TabsTrigger>
                  <TabsTrigger value="duplicate" className="text-xs font-semibold">
                    Duplicates ({bulkQuestions.filter(q => q.isDuplicate).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="valid" className="space-y-3">
                  {bulkQuestions.filter(q => !q.errors && !q.isDuplicate).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8 bg-muted/10 border border-dashed rounded-lg">No valid questions in this batch.</p>
                  ) : (
                    bulkQuestions.filter(q => !q.errors && !q.isDuplicate).map((q) => (
                      <Card key={q.id} className="border-green-500/20 bg-green-500/5 hover:shadow-sm transition-shadow">
                        <CardContent className="pt-4">
                          <p className="font-medium text-sm text-foreground leading-relaxed">{q.text}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">{q.subject}</Badge>
                            <Badge variant="outline" className="text-[10px]">Grade {q.gradeLevel}</Badge>
                            <Badge variant="outline" className="text-[10px] capitalize">{q.difficulty}</Badge>
                            <Badge variant="outline" className="text-[10px] uppercase">{q.type === 'mcq' ? 'MCQ' : 'True/False'}</Badge>
                          </div>
                          {q.options && q.options.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className={`px-2 py-1 rounded border border-border/50 ${
                                  (typeof q.correctAnswer === 'number' ? q.correctAnswer === oIdx : q.correctAnswer === opt) 
                                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-semibold' 
                                    : ''
                                }`}>
                                  {oIdx + 1}. {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="invalid" className="space-y-3">
                  {bulkQuestions.filter(q => q.errors).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8 bg-muted/10 border border-dashed rounded-lg">No invalid questions found.</p>
                  ) : (
                    bulkQuestions.filter(q => q.errors).map((q) => (
                      <Card key={q.id} className="border-red-500/20 bg-red-500/5">
                        <CardContent className="pt-4">
                          <p className="font-medium text-sm text-muted-foreground leading-relaxed">{q.text || 'Empty Question text'}</p>
                          <ul className="mt-3 pl-4 list-disc text-xs text-red-600 dark:text-red-400 space-y-1">
                            {q.errors?.map((err, errIdx) => (
                              <li key={errIdx}>{err}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="duplicate" className="space-y-3">
                  {bulkQuestions.filter(q => q.isDuplicate).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8 bg-muted/10 border border-dashed rounded-lg">No duplicate questions detected.</p>
                  ) : (
                    bulkQuestions.filter(q => q.isDuplicate).map((q) => (
                      <Card key={q.id} className="border-yellow-500/20 bg-yellow-500/5">
                        <CardContent className="pt-4">
                          <p className="font-medium text-sm text-foreground leading-relaxed">{q.text}</p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> This question matches another row text in your file.
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleResetImport}>
                  Start Over
                </Button>
                <Button
                  onClick={handleBulkImport}
                  disabled={isImporting || bulkQuestions.filter(q => !q.errors && !q.isDuplicate).length === 0}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold text-white px-6"
                >
                  {isImporting ? 'Importing...' : `Import ${bulkQuestions.filter(q => !q.errors && !q.isDuplicate).length} Questions`}
                </Button>
              </div>
            </div>
          )}

          {importStep === 'confirm' && (
            <Card className="border border-border bg-card/60 backdrop-blur shadow-sm animate-fadeIn">
              <CardContent className="pt-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Import Complete!</h2>
                  <p className="text-muted-foreground text-sm">
                    Successfully imported <strong className="text-foreground">{importedCount}</strong> new questions into the library.
                  </p>
                </div>
                <Button onClick={handleResetImport} className="bg-gradient-to-r from-primary to-accent font-semibold text-white px-6 hover:opacity-90">
                  Import More Questions
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
