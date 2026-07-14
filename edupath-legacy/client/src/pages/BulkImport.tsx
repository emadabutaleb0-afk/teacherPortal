import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';

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

export default function BulkImport() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<ImportedQuestion[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');

  const downloadTemplate = () => {
    const template = `text,type,options,correctAnswer,explanation,subject,gradeLevel,difficulty
"What is the capital of France?","mcq","Paris|London|Berlin|Madrid","Paris","The capital of France is Paris.","Geography",6,"easy"
"2 + 2 = 4","trueFalse","","true","2 + 2 equals 4.","Mathematics",4,"easy"
"Photosynthesis is the process by which plants...","mcq","Convert light to chemical energy|Absorb water only|Produce oxygen only","Convert light to chemical energy","Photosynthesis converts light energy into chemical energy.","Science",7,"medium"`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(template));
    element.setAttribute('download', 'questions_template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const validateQuestion = (question: any, index: number): ImportedQuestion => {
    const errors: string[] = [];
    const id = `import-${Date.now()}-${index}`;

    // Validate required fields
    if (!question.text) errors.push('Question text is required');
    if (!question.type || !['mcq', 'trueFalse'].includes(question.type)) {
      errors.push('Type must be "mcq" or "trueFalse"');
    }
    if (!question.correctAnswer) errors.push('Correct answer is required');
    if (!question.explanation) errors.push('Explanation is required');
    if (!question.subject) errors.push('Subject is required');
    if (!question.gradeLevel || isNaN(parseInt(question.gradeLevel))) {
      errors.push('Grade level must be a number');
    }
    if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty)) {
      errors.push('Difficulty must be "easy", "medium", or "hard"');
    }

    // Validate MCQ specific fields
    if (question.type === 'mcq') {
      if (!question.options) {
        errors.push('MCQ must have options (pipe-separated)');
      } else {
        const optionsArray = question.options.split('|').map((o: string) => o.trim());
        if (optionsArray.length < 2) {
          errors.push('MCQ must have at least 2 options');
        }
        if (!optionsArray.includes(question.correctAnswer)) {
          errors.push('Correct answer must be one of the options');
        }
      }
    }

    return {
      id,
      text: question.text || '',
      type: question.type || 'mcq',
      options: question.type === 'mcq' ? question.options?.split('|').map((o: string) => o.trim()) : undefined,
      correctAnswer: question.correctAnswer || '',
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
        const lines = csv.split('\n').slice(1); // Skip header
        const parsedQuestions: ImportedQuestion[] = [];
        const errors: string[] = [];

        lines.forEach((line, index) => {
          if (!line.trim()) return;

          // Simple CSV parsing (handles quoted fields)
          const regex = /"([^"]*)"|([^,]+)/g;
          const fields: string[] = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            fields.push(match[1] || match[2]);
          }

          if (fields.length < 8) {
            errors.push(`Row ${index + 2}: Invalid number of fields`);
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

        // Check for duplicates
        const uniqueTexts = new Set<string>();
        parsedQuestions.forEach(q => {
          if (uniqueTexts.has(q.text)) {
            q.isDuplicate = true;
            errors.push(`Duplicate question: "${q.text.substring(0, 50)}..."`);
          }
          uniqueTexts.add(q.text);
        });

        setQuestions(parsedQuestions);
        setValidationErrors(errors);
        setStep('preview');
      } catch (error) {
        setValidationErrors(['Error parsing CSV file. Please check the format.']);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    const validQuestions = questions.filter(q => !q.errors && !q.isDuplicate);
    setImportedCount(validQuestions.length);
    setStep('confirm');
  };

  const handleReset = () => {
    setUploadedFile(null);
    setQuestions([]);
    setValidationErrors([]);
    setImportedCount(0);
    setStep('upload');
  };

  const validQuestions = questions.filter(q => !q.errors && !q.isDuplicate);
  const invalidQuestions = questions.filter(q => q.errors);
  const duplicateQuestions = questions.filter(q => q.isDuplicate);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-4xl animate-slide-up">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Bulk Question Import</h1>
          <p className="text-muted-foreground">Upload multiple questions at once from CSV or Excel</p>
        </div>

        {step === 'upload' && (
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Upload Questions File</CardTitle>
              <CardDescription>Supported formats: CSV, Excel (saved as CSV)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Download */}
              <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Download Template</p>
                    <p className="text-sm text-muted-foreground">Get the CSV template to format your questions</p>
                  </div>
                </div>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-semibold text-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">CSV or Excel files up to 10MB</p>
                </label>
              </div>

              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'preview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{questions.length}</div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">{validQuestions.length}</div>
                    <p className="text-sm text-muted-foreground">Valid</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive">{invalidQuestions.length + duplicateQuestions.length}</div>
                    <p className="text-sm text-muted-foreground">Issues</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Validation Issues Found:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.slice(0, 5).map((error, i) => (
                      <li key={i} className="text-sm">
                        {error}
                      </li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li className="text-sm">... and {validationErrors.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Questions Preview */}
            <Tabs defaultValue="valid">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="valid">Valid ({validQuestions.length})</TabsTrigger>
                <TabsTrigger value="invalid">Invalid ({invalidQuestions.length})</TabsTrigger>
                <TabsTrigger value="duplicate">Duplicates ({duplicateQuestions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="valid" className="space-y-3">
                {validQuestions.map(q => (
                  <Card key={q.id} className="border-success/20 bg-success/5">
                    <CardContent className="pt-4">
                      <p className="font-medium text-foreground mb-2">{q.text}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{q.subject}</Badge>
                        <Badge variant="outline">Grade {q.gradeLevel}</Badge>
                        <Badge variant="outline">{q.difficulty}</Badge>
                        <Badge variant="outline">{q.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="invalid" className="space-y-3">
                {invalidQuestions.map(q => (
                  <Card key={q.id} className="border-destructive/20 bg-destructive/5">
                    <CardContent className="pt-4">
                      <p className="font-medium text-foreground mb-2">{q.text}</p>
                      <ul className="list-disc list-inside space-y-1 mb-2">
                        {q.errors?.map((error, i) => (
                          <li key={i} className="text-sm text-destructive">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="duplicate" className="space-y-3">
                {duplicateQuestions.map(q => (
                  <Card key={q.id} className="border-warning/20 bg-warning/5">
                    <CardContent className="pt-4">
                      <p className="font-medium text-foreground mb-2">{q.text}</p>
                      <p className="text-sm text-warning font-medium">This question already exists in the import</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleReset}>
                Start Over
              </Button>
              <Button
                onClick={handleImport}
                disabled={validQuestions.length === 0}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                Import {validQuestions.length} Questions
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <Card className="hover-lift animate-fadeIn">
            <CardContent className="pt-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Import Successful!</h2>
                <p className="text-muted-foreground">
                  {importedCount} question{importedCount !== 1 ? 's' : ''} have been added to the question bank.
                </p>
                <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
                  You can now use these questions when creating new tests.
                </div>
                <Button onClick={handleReset} className="bg-gradient-to-r from-primary to-primary/80">
                  Import More Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
