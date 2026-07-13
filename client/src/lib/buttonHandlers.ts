/**
 * Reusable button handler functions for common operations across EduPath
 */

import { toast } from 'sonner';

// ============================================================================
// Generic CRUD Handlers
// ============================================================================

export const createCRUDHandlers = <T extends { id: string }>(
  items: T[],
  setItems: (items: T[]) => void
) => {
  return {
    /**
     * Handle add/create operation
     */
    handleAdd: (newItem: T) => {
      setItems([...items, newItem]);
      toast.success('Item added successfully');
    },

    /**
     * Handle edit/update operation
     */
    handleEdit: (id: string, updates: Partial<T>) => {
      setItems(
        items.map(item => (item.id === id ? { ...item, ...updates } : item))
      );
      toast.success('Item updated successfully');
    },

    /**
     * Handle delete operation
     */
    handleDelete: (id: string) => {
      setItems(items.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    },

    /**
     * Handle batch delete operation
     */
    handleBatchDelete: (ids: string[]) => {
      const idSet = new Set(ids);
      setItems(items.filter(item => !idSet.has(item.id)));
      toast.success(`${ids.length} items deleted successfully`);
    },

    /**
     * Handle approve operation
     */
    handleApprove: (id: string) => {
      setItems(
        items.map(item =>
          item.id === id ? { ...item, status: 'approved' } : item
        )
      );
      toast.success('Item approved');
    },

    /**
     * Handle reject operation
     */
    handleReject: (id: string) => {
      setItems(
        items.map(item =>
          item.id === id ? { ...item, status: 'rejected' } : item
        )
      );
      toast.error('Item rejected');
    },

    /**
     * Handle status toggle
     */
    handleToggleStatus: (id: string, statusField: keyof T = 'status' as any) => {
      setItems(
        items.map(item => {
          if (item.id === id) {
            const currentStatus = item[statusField];
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            return { ...item, [statusField]: newStatus };
          }
          return item;
        })
      );
      toast.success('Status updated');
    },
  };
};

// ============================================================================
// Form Handlers
// ============================================================================

export const createFormHandlers = () => {
  return {
    /**
     * Handle form field change
     */
    handleFieldChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      formData: Record<string, any>,
      setFormData: (data: Record<string, any>) => void
    ) => {
      const { name, value, type } = e.target;
      const actualValue =
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setFormData({ ...formData, [name]: actualValue });
    },

    /**
     * Handle form submission
     */
    handleFormSubmit: async (
      e: React.FormEvent,
      onSubmit: () => Promise<void> | void,
      onSuccess?: () => void
    ) => {
      e.preventDefault();
      try {
        await onSubmit();
        onSuccess?.();
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error('An error occurred. Please try again.');
      }
    },

    /**
     * Handle form reset
     */
    handleFormReset: (
      initialValues: Record<string, any>,
      setFormData: (data: Record<string, any>) => void
    ) => {
      setFormData(initialValues);
      toast.info('Form reset');
    },

    /**
     * Handle file input change
     */
    handleFileChange: (
      e: React.ChangeEvent<HTMLInputElement>,
      onFileSelected: (file: File) => void
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelected(file);
      }
    },
  };
};

// ============================================================================
// Filter & Search Handlers
// ============================================================================

export const createFilterHandlers = () => {
  return {
    /**
     * Handle filter change
     */
    handleFilterChange: (
      filterName: string,
      value: any,
      filters: Record<string, any>,
      setFilters: (filters: Record<string, any>) => void
    ) => {
      setFilters({ ...filters, [filterName]: value });
    },

    /**
     * Handle clear filters
     */
    handleClearFilters: (
      initialFilters: Record<string, any>,
      setFilters: (filters: Record<string, any>) => void
    ) => {
      setFilters(initialFilters);
      toast.info('Filters cleared');
    },

    /**
     * Handle search input
     */
    handleSearch: (
      searchTerm: string,
      setSearchTerm: (term: string) => void
    ) => {
      setSearchTerm(searchTerm);
    },

    /**
     * Handle sort change
     */
    handleSortChange: (
      sortField: string,
      sortDirection: 'asc' | 'desc',
      setSortConfig: (config: { field: string; direction: 'asc' | 'desc' }) => void
    ) => {
      setSortConfig({ field: sortField, direction: sortDirection });
    },
  };
};

// ============================================================================
// Dialog/Modal Handlers
// ============================================================================

export const createDialogHandlers = () => {
  return {
    /**
     * Handle dialog open
     */
    handleOpenDialog: (
      dialogId: string,
      openDialogs: Set<string>,
      setOpenDialogs: (dialogs: Set<string>) => void
    ) => {
      const newDialogs = new Set(openDialogs);
      newDialogs.add(dialogId);
      setOpenDialogs(newDialogs);
    },

    /**
     * Handle dialog close
     */
    handleCloseDialog: (
      dialogId: string,
      openDialogs: Set<string>,
      setOpenDialogs: (dialogs: Set<string>) => void
    ) => {
      const newDialogs = new Set(openDialogs);
      newDialogs.delete(dialogId);
      setOpenDialogs(newDialogs);
    },

    /**
     * Check if dialog is open
     */
    isDialogOpen: (
      dialogId: string,
      openDialogs: Set<string>
    ): boolean => {
      return openDialogs.has(dialogId);
    },
  };
};

// ============================================================================
// Navigation Handlers
// ============================================================================

export const createNavigationHandlers = () => {
  return {
    /**
     * Handle navigation with confirmation
     */
    handleNavigateWithConfirmation: (
      onConfirm: () => void,
      message: string = 'Are you sure you want to leave?'
    ) => {
      if (window.confirm(message)) {
        onConfirm();
      }
    },

    /**
     * Handle back navigation
     */
    handleGoBack: () => {
      window.history.back();
    },

    /**
     * Handle external link
     */
    handleExternalLink: (url: string, target: '_blank' | '_self' = '_blank') => {
      window.open(url, target);
    },
  };
};

// ============================================================================
// Export Handlers
// ============================================================================

export const createExportHandlers = () => {
  return {
    /**
     * Handle CSV export
     */
    handleExportCSV: <T>(items: T[], filename: string = 'export.csv') => {
      if (items.length === 0) {
        toast.error('No data to export');
        return;
      }

      try {
        const headers = Object.keys(items[0] as object);
        const csvContent = [
          headers.join(','),
          ...items.map(item => {
            return headers
              .map(header => {
                const value = (item as any)[header];
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

        toast.success(`Exported ${items.length} items to CSV`);
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export data');
      }
    },

    /**
     * Handle JSON export
     */
    handleExportJSON: <T>(items: T[], filename: string = 'export.json') => {
      if (items.length === 0) {
        toast.error('No data to export');
        return;
      }

      try {
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

        toast.success(`Exported ${items.length} items to JSON`);
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export data');
      }
    },

    /**
     * Handle PDF export (placeholder - requires additional library)
     */
    handleExportPDF: <T>(items: T[], filename: string = 'export.pdf') => {
      toast.info('PDF export feature coming soon');
    },
  };
};

// ============================================================================
// Notification Handlers
// ============================================================================

export const createNotificationHandlers = () => {
  return {
    /**
     * Show success notification
     */
    showSuccess: (message: string) => {
      toast.success(message);
    },

    /**
     * Show error notification
     */
    showError: (message: string) => {
      toast.error(message);
    },

    /**
     * Show info notification
     */
    showInfo: (message: string) => {
      toast.info(message);
    },

    /**
     * Show warning notification
     */
    showWarning: (message: string) => {
      toast.warning(message);
    },

    /**
     * Show loading notification
     */
    showLoading: (message: string) => {
      toast.loading(message);
    },
  };
};

// ============================================================================
// Confirmation Handlers
// ============================================================================

export const createConfirmationHandlers = () => {
  return {
    /**
     * Show confirmation dialog
     */
    showConfirmation: (
      message: string,
      onConfirm: () => void,
      onCancel?: () => void
    ) => {
      if (window.confirm(message)) {
        onConfirm();
      } else {
        onCancel?.();
      }
    },

    /**
     * Show delete confirmation
     */
    showDeleteConfirmation: (
      itemName: string,
      onConfirm: () => void
    ) => {
      if (window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
        onConfirm();
      }
    },

    /**
     * Show unsaved changes warning
     */
    showUnsavedChangesWarning: (onConfirm: () => void) => {
      if (window.confirm('You have unsaved changes. Do you want to leave without saving?')) {
        onConfirm();
      }
    },
  };
};
