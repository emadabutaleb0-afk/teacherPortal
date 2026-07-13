import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// ============================================================================
// CRUD Operations
// ============================================================================

export const crudOperations = {
  /**
   * Create a new item with a unique ID
   */
  create: <T extends { id?: string }>(item: T, idPrefix: string = 'item'): T => {
    return {
      ...item,
      id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  },

  /**
   * Read/Find an item by ID
   */
  read: <T extends { id: string }>(items: T[], id: string): T | undefined => {
    return items.find(item => item.id === id);
  },

  /**
   * Update an item by ID
   */
  update: <T extends { id: string }>(items: T[], id: string, updates: Partial<T>): T[] => {
    return items.map(item => (item.id === id ? { ...item, ...updates } : item));
  },

  /**
   * Delete an item by ID
   */
  delete: <T extends { id: string }>(items: T[], id: string): T[] => {
    return items.filter(item => item.id !== id);
  },

  /**
   * Batch update multiple items
   */
  batchUpdate: <T extends { id: string }>(items: T[], updates: Record<string, Partial<T>>): T[] => {
    return items.map(item => (updates[item.id] ? { ...item, ...updates[item.id] } : item));
  },

  /**
   * Batch delete multiple items
   */
  batchDelete: <T extends { id: string }>(items: T[], ids: string[]): T[] => {
    const idSet = new Set(ids);
    return items.filter(item => !idSet.has(item.id));
  },
};

// ============================================================================
// Filtering & Searching
// ============================================================================

export const filterOperations = {
  /**
   * Filter items by a single field value
   */
  filterByField: <T>(items: T[], field: keyof T, value: any): T[] => {
    return items.filter(item => item[field] === value);
  },

  /**
   * Filter items by multiple field values
   */
  filterByFields: <T>(items: T[], filters: Record<string, any>): T[] => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === 'all' || value === '') return true;
        return item[key as keyof T] === value;
      });
    });
  },

  /**
   * Search items by text in multiple fields
   */
  search: <T>(items: T[], searchTerm: string, fields: (keyof T)[]): T[] => {
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      fields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        return false;
      })
    );
  },

  /**
   * Filter items within a date range
   */
  filterByDateRange: <T extends { date?: string | Date }>(
    items: T[],
    startDate: Date,
    endDate: Date
  ): T[] => {
    return items.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  },

  /**
   * Filter items by numeric range
   */
  filterByRange: <T>(items: T[], field: keyof T, min: number, max: number): T[] => {
    return items.filter(item => {
      const value = item[field];
      if (typeof value === 'number') {
        return value >= min && value <= max;
      }
      return false;
    });
  },
};

// ============================================================================
// Sorting
// ============================================================================

export const sortOperations = {
  /**
   * Sort items by a field in ascending or descending order
   */
  sortByField: <T>(items: T[], field: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    const sorted = [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  },

  /**
   * Sort items by multiple fields
   */
  sortByMultipleFields: <T>(
    items: T[],
    sortConfig: Array<{ field: keyof T; direction: 'asc' | 'desc' }>
  ): T[] => {
    return [...items].sort((a, b) => {
      for (const { field, direction } of sortConfig) {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal === bVal) continue;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
      }
      return 0;
    });
  },
};

// ============================================================================
// Data Export
// ============================================================================

export const exportOperations = {
  /**
   * Export data to CSV format
   */
  exportToCSV: <T>(items: T[], filename: string = 'export.csv'): void => {
    if (items.length === 0) return;

    const headers = Object.keys(items[0] as object);
    const csvContent = [
      headers.join(','),
      ...items.map(item => {
        return headers
          .map(header => {
            const value = (item as any)[header];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export data to JSON format
   */
  exportToJSON: <T>(items: T[], filename: string = 'export.json'): void => {
    const jsonContent = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Generate a shareable link (mock implementation)
   */
  generateShareLink: (id: string, type: string = 'test'): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${type}/${id}`;
  },
};

// ============================================================================
// Form Validation
// ============================================================================

export const validationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): { isValid: boolean; strength: 'weak' | 'medium' | 'strong' } => {
    if (password.length < 6) {
      return { isValid: false, strength: 'weak' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const strength =
      hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
        ? 'strong'
        : hasUpperCase && hasLowerCase && hasNumbers
          ? 'medium'
          : 'weak';

    return {
      isValid: password.length >= 8 && (strength === 'medium' || strength === 'strong'),
      strength,
    };
  },

  /**
   * Validate required fields
   */
  validateRequired: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },

  /**
   * Validate form object
   */
  validateForm: (
    formData: Record<string, any>,
    rules: Record<string, (value: any) => boolean | string>
  ): Record<string, string> => {
    const errors: Record<string, string> = {};

    Object.entries(rules).forEach(([field, validator]) => {
      const result = validator(formData[field]);
      if (result !== true && typeof result === 'string') {
        errors[field] = result;
      }
    });

    return errors;
  },

  /**
   * Get password strength label
   */
  getPasswordStrengthLabel: (strength: 'weak' | 'medium' | 'strong'): string => {
    const labels = {
      weak: 'Weak - Add uppercase, numbers, and special characters',
      medium: 'Medium - Add special characters for stronger password',
      strong: 'Strong - Great password!',
    };
    return labels[strength];
  },
};

// ============================================================================
// Data Formatting
// ============================================================================

export const formatUtils = {
  /**
   * Format date to readable string
   */
  formatDate: (date: Date | string, format: 'short' | 'long' = 'short'): string => {
    const d = new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  },

  /**
   * Format time to readable string
   */
  formatTime: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  },

  /**
   * Format percentage
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Format score with grade
   */
  formatScoreWithGrade: (score: number): { score: string; grade: string; color: string } => {
    const percentage = score;
    let grade = 'F';
    let color = 'text-red-600';

    if (percentage >= 90) {
      grade = 'A';
      color = 'text-green-600';
    } else if (percentage >= 80) {
      grade = 'B';
      color = 'text-green-500';
    } else if (percentage >= 70) {
      grade = 'C';
      color = 'text-yellow-600';
    } else if (percentage >= 60) {
      grade = 'D';
      color = 'text-orange-600';
    }

    return {
      score: `${score.toFixed(1)}%`,
      grade,
      color,
    };
  },
};

// ============================================================================
// Local Storage Management
// ============================================================================

export const storageUtils = {
  /**
   * Save data to localStorage
   */
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  },

  /**
   * Load data from localStorage
   */
  load: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return defaultValue ?? null;
    }
  },

  /**
   * Remove data from localStorage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  },

  /**
   * Clear all localStorage
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

// ============================================================================
// Common Calculations
// ============================================================================

export const calculationUtils = {
  /**
   * Calculate average
   */
  average: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  },

  /**
   * Calculate median
   */
  median: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  /**
   * Calculate standard deviation
   */
  standardDeviation: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    const avg = calculationUtils.average(numbers);
    const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));
    return Math.sqrt(calculationUtils.average(squareDiffs));
  },

  /**
   * Calculate percentile
   */
  percentile: (numbers: number[], percentile: number): number => {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  },
};
