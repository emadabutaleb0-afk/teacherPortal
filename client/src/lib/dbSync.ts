import { 
  mockTests, 
  mockQuestions, 
  mockTestResults, 
  mockAllUsers, 
  mockCheatDetectionFlags, 
  mockContentVersions, 
  mockUserActivities,
  mockEnrollments,
  availableSubjects,
  availableGrades,
  Test,
  Question,
  TestResult,
  UserAccount,
  User,
  CheatDetectionFlag,
  ContentVersion,
  UserActivity,
  Enrollment
} from './mockData';

// DB Mode cache
export let activeDBMode: 'mock' | 'postgres' = 'mock';

// Helper to parse string grades (e.g. "Grade 4") to numeric values (e.g. 4)
const parseGradeValue = (g: any): number => {
  if (typeof g === 'number') return g;
  const num = parseInt(g.toString().replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? g : num;
};

// -------------------------------------------------------------
// 1. DYNAMIC SYSTEM HYDRATION ENGINE
// -------------------------------------------------------------
export async function hydrateDatabaseState(): Promise<void> {
  console.log('🔄 Hydrating EduPath frontend memory matrices from persistent backend DB...');
  
  try {
    // 1. Fetch current db mode
    const modeRes = await fetch('/api/db-mode');
    if (modeRes.ok) {
      const modeData = await modeRes.json();
      activeDBMode = modeData.dbMode;
      console.log(`🔌 Current System Database Driver: ${activeDBMode === 'postgres' ? 'Active PostgreSQL Connection' : 'Persistent SQLite Simulation'}`);
    }

    // 2. Fetch registries
    const regRes = await fetch('/api/academic-registries');
    if (regRes.ok) {
      const regData = await regRes.json();
      availableSubjects.length = 0;
      availableSubjects.push(...regData.subjects);
      
      availableGrades.length = 0;
      const parsedGrades = regData.grades.map(parseGradeValue);
      parsedGrades.sort((a: number, b: number) => a - b);
      availableGrades.push(...parsedGrades);
    }

    // 3. Fetch questions
    const qRes = await fetch('/api/questions');
    if (qRes.ok) {
      const questionsData = await qRes.json();
      mockQuestions.length = 0;
      mockQuestions.push(...questionsData);
    }

    // 4. Fetch tests
    const tRes = await fetch('/api/tests');
    if (tRes.ok) {
      const testsData = await tRes.json();
      mockTests.length = 0;
      mockTests.push(...testsData);
      
      // Load custom tests from localStorage fallback to ensure they are available in memory
      const stored = localStorage.getItem('edupath_custom_tests');
      if (stored) {
        try {
          const custom = JSON.parse(stored);
          custom.forEach((ct: any) => {
            if (!mockTests.some(t => t.id === ct.id)) {
              mockTests.unshift(ct);
            }
          });
        } catch (e) {
          console.error('Failed to parse custom tests from localStorage', e);
        }
      }
    }

    // 5. Fetch users
    const uRes = await fetch('/api/users');
    if (uRes.ok) {
      const usersData = await uRes.json();
      mockAllUsers.length = 0;
      mockAllUsers.push(...usersData);
    }

    // 6. Fetch test results
    const rRes = await fetch('/api/test-results');
    if (rRes.ok) {
      const resultsData = await rRes.json();
      mockTestResults.length = 0;
      mockTestResults.push(...resultsData);
    }

    // 7. Fetch cheating flags
    const fRes = await fetch('/api/cheating-flags');
    if (fRes.ok) {
      const flagsData = await fRes.json();
      mockCheatDetectionFlags.length = 0;
      mockCheatDetectionFlags.push(...flagsData);
    }

    // 8. Fetch content versions
    const cvRes = await fetch('/api/content-versions');
    if (cvRes.ok) {
      const contentData = await cvRes.json();
      mockContentVersions.length = 0;
      mockContentVersions.push(...contentData);
    }

    // 9. Fetch user activities
    const actRes = await fetch('/api/user-activities');
    if (actRes.ok) {
      const actData = await actRes.json();
      mockUserActivities.length = 0;
      mockUserActivities.push(...actData);
    }

    // 10. Fetch student teacher enrollments
    const enrollRes = await fetch('/api/enrollments');
    if (enrollRes.ok) {
      const enrollData = await enrollRes.json();
      mockEnrollments.length = 0;
      mockEnrollments.push(...enrollData);
    }

    console.log('✅ Database Hydration complete! Loaded memory arrays synchronized perfectly.');
  } catch (e) {
    console.error('❌ Failed to hydrate database state from API, operating on local mock arrays', e);
  }
}

// -------------------------------------------------------------
// 2. SYNCHRONOUS DATA WRITER UTILITIES
// -------------------------------------------------------------

export async function saveTestToDB(test: Test): Promise<boolean> {
  try {
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    });
    if (res.ok) {
      // Sync client in-place
      const idx = mockTests.findIndex(t => t.id === test.id);
      if (idx !== -1) {
        mockTests[idx] = test;
      } else {
        mockTests.unshift(test);
      }
      return true;
    }
  } catch (e) {
    console.error('saveTestToDB failed', e);
  }
  return false;
}

export async function deleteTestFromDB(testId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/tests/${testId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const idx = mockTests.findIndex(t => t.id === testId);
      if (idx !== -1) {
        mockTests.splice(idx, 1);
      }
      return true;
    }
  } catch (e) {
    console.error('deleteTestFromDB failed', e);
  }
  return false;
}

export async function saveQuestionToDB(question: Question): Promise<boolean> {
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    if (res.ok) {
      const idx = mockQuestions.findIndex(q => q.id === question.id);
      if (idx !== -1) {
        mockQuestions[idx] = question;
      } else {
        mockQuestions.unshift(question);
      }
      return true;
    }
  } catch (e) {
    console.error('saveQuestionToDB failed', e);
  }
  return false;
}

export async function saveResultToDB(result: TestResult): Promise<boolean> {
  try {
    const res = await fetch('/api/test-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
    if (res.ok) {
      mockTestResults.unshift(result);
      // Auto log active completed result
      await saveActivityToDB({
        id: `act-${Date.now()}`,
        userId: result.studentId,
        action: 'test_completed',
        details: `Completed exam "${result.testTitle}" with score ${result.score}/${result.totalScore} (${result.percentage}%)`,
        timestamp: new Date()
      });
      return true;
    }
  } catch (e) {
    console.error('saveResultToDB failed', e);
  }
  return false;
}

export async function saveUserToDB(user: UserAccount): Promise<boolean> {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (res.ok) {
      if (!mockAllUsers.some(u => u.id === user.id)) {
        mockAllUsers.push(user);
      }
      return true;
    }
  } catch (e) {
    console.error('saveUserToDB failed', e);
  }
  return false;
}

export async function saveProfileToDB(userId: string, updates: Partial<UserAccount>): Promise<boolean> {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const idx = mockAllUsers.findIndex(u => u.id === userId);
      if (idx !== -1) {
        mockAllUsers[idx] = { ...mockAllUsers[idx], ...updates };
      }
      return true;
    }
  } catch (e) {
    console.error('saveProfileToDB failed', e);
  }
  return false;
}

export async function saveCheatingFlagToDB(flagId: string, status: 'pending' | 'reviewed' | 'confirmed' | 'dismissed'): Promise<boolean> {
  try {
    const res = await fetch(`/api/cheating-flags/${flagId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const idx = mockCheatDetectionFlags.findIndex(f => f.id === flagId);
      if (idx !== -1) {
        mockCheatDetectionFlags[idx].status = status;
      }
      return true;
    }
  } catch (e) {
    console.error('saveCheatingFlagToDB failed', e);
  }
  return false;
}

export async function saveContentVersionToDB(version: ContentVersion): Promise<boolean> {
  try {
    const res = await fetch('/api/content-versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(version)
    });
    if (res.ok) {
      mockContentVersions.unshift(version);
      return true;
    }
  } catch (e) {
    console.error('saveContentVersionToDB failed', e);
  }
  return false;
}

export async function saveActivityToDB(activity: UserActivity): Promise<boolean> {
  try {
    const res = await fetch('/api/user-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    if (res.ok) {
      mockUserActivities.unshift(activity);
      return true;
    }
  } catch (e) {
    console.error('saveActivityToDB failed', e);
  }
  return false;
}

export async function syncAcademicRegistry(type: 'subject' | 'grade', value: string): Promise<boolean> {
  try {
    const res = await fetch('/api/academic-registries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value })
    });
    if (res.ok) {
      const data = await res.json();
      availableSubjects.length = 0;
      availableSubjects.push(...data.subjects);
      
      availableGrades.length = 0;
      const parsedGrades = data.grades.map(parseGradeValue);
      parsedGrades.sort((a: number, b: number) => a - b);
      availableGrades.push(...parsedGrades);
      return true;
    }
  } catch (e) {
    console.error('syncAcademicRegistry failed', e);
  }
  return false;
}

export async function toggleDBMode(mode: 'mock' | 'postgres'): Promise<{ success: boolean; dbMode: 'mock' | 'postgres'; message?: string }> {
  try {
    const res = await fetch('/api/db-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    if (res.ok) {
      const data = await res.json();
      activeDBMode = data.dbMode;
      // Re-hydrate state to fetch mode-specific tables immediately!
      await hydrateDatabaseState();
      return { success: true, dbMode: activeDBMode };
    } else {
      const data = await res.json();
      return { success: false, dbMode: activeDBMode, message: data.message };
    }
  } catch (e: any) {
    console.error('toggleDBMode failed', e);
    return { success: false, dbMode: activeDBMode, message: e.message };
  }
}

export async function runSQLSeeder(): Promise<{ success: boolean; message: string; rowsSeeded?: number }> {
  try {
    const res = await fetch('/api/run-seeder', { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.success) {
      // Re-hydrate state to pull seeded tables
      await hydrateDatabaseState();
      return { success: true, message: data.message, rowsSeeded: data.rowsSeeded };
    } else {
      return { success: false, message: data.error || 'Failed to execute seeding transaction.' };
    }
  } catch (e: any) {
    console.error('runSQLSeeder failed', e);
    return { success: false, message: e.message };
  }
}

export async function getDBStatus(): Promise<any> {
  try {
    const res = await fetch('/api/db-status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('getDBStatus failed', e);
  }
  return null;
}

// Helper: Derive a student's active subjects from enrollments (single source of truth)
export function getStudentSubjectsFromEnrollments(studentId: string): string[] {
  const subjects = mockEnrollments.filter(e => e.studentId === studentId).map(e => e.subject);
  return subjects.filter((val, idx, self) => self.indexOf(val) === idx);
}

export async function enrollStudent(studentId: string, teacherId: string, subject: string): Promise<boolean> {
  try {
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, teacherId, subject })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        // Sync local enrollment memory
        const exists = mockEnrollments.some(
          e => e.studentId === studentId && e.teacherId === teacherId && e.subject === subject
        );
        if (!exists) {
          mockEnrollments.push(data.enrollment);
        }
        // Sync user.subjects from enrollments (single source of truth)
        const updatedSubjects = getStudentSubjectsFromEnrollments(studentId);
        await saveProfileToDB(studentId, { subjects: updatedSubjects });
        // Also sync the in-memory mockAllUsers array
        const userIdx = mockAllUsers.findIndex(u => u.id === studentId);
        if (userIdx !== -1) {
          mockAllUsers[userIdx].subjects = updatedSubjects;
        }
        return true;
      }
    }
  } catch (e) {
    console.error('enrollStudent failed', e);
  }
  return false;
}

export async function unenrollStudent(studentId: string, teacherId: string, subject: string): Promise<boolean> {
  try {
    const res = await fetch('/api/enrollments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, teacherId, subject })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        // Sync local enrollment memory
        const idx = mockEnrollments.findIndex(
          e => e.studentId === studentId && e.teacherId === teacherId && e.subject === subject
        );
        if (idx !== -1) {
          mockEnrollments.splice(idx, 1);
        }
        // Recalculate user.subjects from remaining enrollments (single source of truth)
        const updatedSubjects = getStudentSubjectsFromEnrollments(studentId);
        await saveProfileToDB(studentId, { subjects: updatedSubjects });
        // Also sync the in-memory mockAllUsers array
        const userIdx = mockAllUsers.findIndex(u => u.id === studentId);
        if (userIdx !== -1) {
          mockAllUsers[userIdx].subjects = updatedSubjects;
        }
        return true;
      }
    }
  } catch (e) {
    console.error('unenrollStudent failed', e);
  }
  return false;
}
