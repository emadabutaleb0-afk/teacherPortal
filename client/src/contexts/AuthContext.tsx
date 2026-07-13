import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserAccount, mockAllUsers } from '@/lib/mockData';
import { saveUserToDB, saveProfileToDB } from '@/lib/dbSync';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role?: string) => void;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string, gradeLevel?: number) => void;
  hasPermission: (action: string) => boolean;
  getAllUsers: () => UserAccount[];
  addUser: (newUser: UserAccount) => void;
  updateUser: (userId: string, updates: Partial<UserAccount>) => void;
  deleteUser: (userId: string) => void;
  linkParentToStudent: (parentId: string, studentId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  resetPassword: (email: string) => boolean;
  getCurrentUser: () => User | null;
  isUserAdmin: () => boolean;
  isUserSuperAdmin: () => boolean;
  isUserStudent: () => boolean;
  isUserParent: () => boolean;
  isUserTeacher: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('edupath_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [allUsers, setAllUsers] = useState<UserAccount[]>(mockAllUsers);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('edupath_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('edupath_user');
    }
  }, [user]);

  // Reconcile and synchronize localStorage user with database state
  useEffect(() => {
    if (user && allUsers.length > 0) {
      const dbUser = allUsers.find(u => u.email === user.email && u.role === user.role);
      if (dbUser && (dbUser.id !== user.id || JSON.stringify(dbUser.linkedStudents) !== JSON.stringify(user.linkedStudents))) {
        setUser(dbUser as User);
        localStorage.setItem('edupath_user', JSON.stringify(dbUser));
      }
    }
  }, [allUsers, user]);

  const login = (email: string, password: string, role?: string) => {
    // Check if email matches any existing user exactly
    const emailMatch = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (emailMatch) {
      setUser(emailMatch as User);
    } else {
      const effectiveRole = role || (email.toLowerCase().includes('superadmin') ? 'superadmin' : email.toLowerCase().includes('teacher') ? 'teacher' : 'student');
      const mockUser: User = {
        id: `${effectiveRole}-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: effectiveRole as any,
        gradeLevel: effectiveRole === 'student' ? 8 : undefined,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        subjects: effectiveRole === 'student' ? [] : undefined,
      };
      setUser(mockUser);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edupath_user');
  };

  const register = async (name: string, email: string, password: string, role: string, gradeLevel?: number) => {
    const emailMatch = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailMatch) {
      throw new Error('Email is already registered.');
    }

    const newUser: UserAccount = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      role: role as any,
      gradeLevel: role === 'student' ? gradeLevel : undefined,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      subjects: role === 'student' ? [] : undefined,
    };
    await saveUserToDB(newUser);
    setAllUsers([...allUsers, newUser]);
    setUser(newUser as User);
  };

  const hasPermission = (action: string): boolean => {
    if (!user) return false;

    const permissions: Record<string, string[]> = {
      superadmin: [
        'view_all_users',
        'manage_users',
        'manage_tests',
        'manage_questions',
        'view_all_reports',
        'configure_settings',
        'access_admin_dashboard',
      ],
      admin: [
        'view_all_users',
        'manage_users',
        'manage_tests',
        'manage_questions',
        'view_all_reports',
        'configure_settings',
        'access_admin_dashboard',
      ],
      parent: [
        'view_own_children',
        'view_children_reports',
        'export_children_results',
        'access_parent_dashboard',
      ],
      student: [
        'view_own_tests',
        'take_tests',
        'view_own_results',
        'view_placement_recommendations',
        'access_student_dashboard',
      ],
      teacher: [
        'view_own_students',
        'manage_tests',
        'manage_questions',
        'manage_curriculum',
        'access_teacher_dashboard',
      ],
    };

    return permissions[user.role]?.includes(action) || false;
  };

  const getAllUsers = (): UserAccount[] => {
    return allUsers;
  };

  const addUser = (newUser: UserAccount) => {
    setAllUsers([...allUsers, newUser]);
  };

  const updateUser = async (userId: string, updates: Partial<UserAccount>) => {
    await saveProfileToDB(userId, updates);
    setAllUsers(allUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const deleteUser = (userId: string) => {
    setAllUsers(allUsers.filter(u => u.id !== userId));
  };

  const linkParentToStudent = async (parentId: string, studentId: string) => {
    let parent = allUsers.find(u => u.id === parentId && u.role === 'parent');
    const student = allUsers.find(u => u.id === studentId && u.role === 'student');

    if (!student) return;

    if (!parent && user && user.id === parentId) {
      parent = {
        ...user,
        status: 'active',
        createdAt: new Date().toISOString()
      } as UserAccount;
      await saveUserToDB(parent);
      allUsers.push(parent);
    }

    if (!parent) return;

    const updatedParentStudents = Array.from(new Set([...(parent.linkedStudents || []), studentId]));
    const updatedStudentParents = Array.from(new Set([...(student.linkedParents || []), parentId]));

    await saveProfileToDB(parentId, { linkedStudents: updatedParentStudents });
    await saveProfileToDB(studentId, { linkedParents: updatedStudentParents });

    const updatedUsers = allUsers.map(u => {
      if (u.id === parentId) {
        return { ...u, linkedStudents: updatedParentStudents };
      }
      if (u.id === studentId) {
        return { ...u, linkedParents: updatedStudentParents };
      }
      return u;
    });

    setAllUsers(updatedUsers);

    if (user && user.id === parentId) {
      const updatedUser = { ...user, linkedStudents: updatedParentStudents };
      setUser(updatedUser);
      localStorage.setItem('edupath_user', JSON.stringify(updatedUser));
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    await saveProfileToDB(user.id, updates);
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('edupath_user', JSON.stringify(updatedUser));
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    if (oldPassword === 'password') {
      localStorage.setItem(`password_${user.id}`, newPassword);
      return true;
    }
    return false;
  };

  const resetPassword = (email: string): boolean => {
    const userExists = allUsers.some(u => u.email === email);
    if (userExists) {
      console.log(`Password reset email sent to ${email}`);
      return true;
    }
    return false;
  };

  const getCurrentUser = (): User | null => {
    return user;
  };

  const isUserAdmin = (): boolean => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  };

  const isUserSuperAdmin = (): boolean => {
    return user?.role === 'superadmin';
  };

  const isUserStudent = (): boolean => {
    return user?.role === 'student';
  };

  const isUserParent = (): boolean => {
    return user?.role === 'parent';
  };

  const isUserTeacher = (): boolean => {
    return user?.role === 'teacher';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading: false,
        login,
        logout,
        register,
        hasPermission,
        getAllUsers,
        addUser,
        updateUser,
        deleteUser,
        linkParentToStudent,
        updateProfile,
        changePassword,
        resetPassword,
        getCurrentUser,
        isUserAdmin,
        isUserSuperAdmin,
        isUserStudent,
        isUserParent,
        isUserTeacher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function usePermission(action: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(action);
}

