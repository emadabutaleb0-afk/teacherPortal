import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { mockAdaptiveTestConfigs } from '@/lib/mockData';

export default function AIAdaptiveTestGenerator() {
  const [, navigate] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTest, setGeneratedTest] = useState(mockAdaptiveTestConfigs[0]);
  const [showResult, setShowResult] = useState(false);

  const handleGenerateAdaptiveTest = async () => {
    setIsGenerating(true);
    setShowResult(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock generate adaptive test
    const newTest = {
      id: `adaptive-${Date.now()}`,
      studentId: 'student-1',
      focusAreas: ['Algebra', 'Word Problems', 'Equations', 'Geometry'],
      difficulty: 'medium' as const,
      questionCount: 20,
      estimatedDuration: 35,
      reasonForSelection: [
        'Student has shown consistent weakness in algebraic expressions',
        'Recent performance indicates need for advanced word problem practice',
        'Medium difficulty recommended based on current proficiency level',
        'Geometry topics selected to strengthen spatial reasoning skills',
      ],
    };

    setGeneratedTest(newTest);
    setIsGenerating(false);
    setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI Adaptive Test Generator</h1>
          </div>
          <p className="text-muted-foreground">Generate personalized tests focused on your weak areas</p>
        </div>

        {/* Main Content */}
        {!showResult ? (
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Generate Your Personalized Test</CardTitle>
              <CardDescription>
                Based on your performance history, we'll create a test tailored to help you improve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Estimated Duration</p>
                  <p className="text-2xl font-bold text-primary">30-40 min</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Question Count</p>
                  <p className="text-2xl font-bold text-primary">15-20</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Difficulty</p>
                  <p className="text-2xl font-bold text-primary">Adaptive</p>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-secondary/50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-foreground">How Adaptive Tests Work:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>AI analyzes your performance history and identifies weak areas</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>Questions are selected to focus on topics you need to improve</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Difficulty adjusts based on your answers during the test</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span>Detailed feedback shows why each question was selected for you</span>
                  </li>
                </ul>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateAdaptiveTest}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary to-primary/80 gap-2 py-6 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Your Test...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Adaptive Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Success Message */}
            <Card className="hover-lift border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Your Adaptive Test is Ready!</h3>
                    <p className="text-sm text-green-800">
                      We've created a personalized test focused on your weak areas. This test will adapt to your performance in real-time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Details */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Questions</p>
                    <p className="text-2xl font-bold text-primary">{generatedTest.questionCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="text-2xl font-bold text-primary">{generatedTest.estimatedDuration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Difficulty</p>
                    <p className="text-2xl font-bold text-primary capitalize">{generatedTest.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <p className="text-2xl font-bold text-primary">Adaptive</p>
                  </div>
                </div>

                {/* Focus Areas */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {generatedTest.focusAreas.map(area => (
                      <Badge key={area} className="bg-primary/20 text-primary border-primary/30">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Why These Questions?
                  </h3>
                  <div className="space-y-2">
                    {generatedTest.reasonForSelection.map((reason, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
                        <span className="text-muted-foreground">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 gap-2"
                    onClick={() => navigate('/test-enhanced/test-005')}
                  >
                    <Zap className="w-4 h-4" />
                    Start Test Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowResult(false)}
                  >
                    Generate Another
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-base">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Take your time - this test adapts to your pace</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Don't worry about getting every question right - that's how we learn</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Read explanations after each question to understand the concepts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>You can review your answers after completing the test</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
