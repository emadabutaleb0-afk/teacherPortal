import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockAllUsers, mockUserActivities, UserActivity } from '@/lib/mockData';
import { Users, Upload, Activity, Lock, Unlock, Trash2, Search, Download } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';

export default function AdminAdvancedUsers() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all-roles');
  const [filterStatus, setFilterStatus] = useState('all-status');
  const [users, setUsers] = useState(mockAllUsers);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userActivities, setUserActivities] = useState(mockUserActivities);
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'import'>('users');
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [currentActivityPage, setCurrentActivityPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentUsersPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    setCurrentActivityPage(1);
  }, [activeTab]);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all-roles' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all-status' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsersPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentUsersPage - 1) * itemsPerPage, currentUsersPage * itemsPerPage);

  const totalActivityPages = Math.ceil(userActivities.length / itemsPerPage);
  const paginatedActivities = userActivities.slice((currentActivityPage - 1) * itemsPerPage, currentActivityPage * itemsPerPage);

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Importing ${file.name}... (Mock implementation) 📂`);
    }
  };

  const selectedUserActivities = selectedUser 
    ? userActivities.filter(a => a.userId === selectedUser)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-primary/20 via-accent/20 to-chart-3/20 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="userGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#userGrid)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Advanced User Management 👥</h1>
              <p className="text-lg text-muted-foreground">Manage users, bulk import, activity logs, and user suspension</p>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8 animate-slide-up">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity Logs
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'import'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Bulk Import
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-roles">All Roles</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-status">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Users ({filteredUsers.length})</CardTitle>
                  <CardDescription>Total users: {users.length}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 font-semibold">Role</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 font-semibold">Created</th>
                          <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((u) => (
                          <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">{u.name}</td>
                            <td className="py-3 px-4">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                u.role === 'admin' ? 'bg-primary/20 text-primary' :
                                u.role === 'student' ? 'bg-accent/20 text-accent-foreground' :
                                'bg-chart-1/20 text-chart-1'
                              }`}>
                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                u.status === 'active'
                                  ? 'bg-success/15 text-success border-success/20'
                                  : 'bg-destructive/15 text-destructive border-destructive/20'
                              }`}>
                                {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuspendUser(u.id)}
                                  className="gap-1"
                                >
                                  {u.status === 'active' ? (
                                    <>
                                      <Lock className="w-3 h-3" />
                                      Suspend
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="w-3 h-3" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalUsersPages > 1 && (
                    <div className="flex justify-center pt-4 mt-4 border-t border-border">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentUsersPage((p) => Math.max(1, p - 1));
                              }}
                              className={currentUsersPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={currentUsersPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentUsersPage(page);
                                }}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentUsersPage((p) => Math.min(totalUsersPages, p + 1));
                              }}
                              className={currentUsersPage === totalUsersPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    User Activity Logs
                  </CardTitle>
                  <CardDescription>Recent user activities across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paginatedActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{activity.action.replace(/_/g, ' ').toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded">{activity.userId}</span>
                      </div>
                    ))}
                  </div>
                  {totalActivityPages > 1 && (
                    <div className="flex justify-center pt-4 mt-6 border-t border-border">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentActivityPage((p) => Math.max(1, p - 1));
                              }}
                              className={currentActivityPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={currentActivityPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentActivityPage(page);
                                }}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentActivityPage((p) => Math.min(totalActivityPages, p + 1));
                              }}
                              className={currentActivityPage === totalActivityPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bulk Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Bulk User Import
                  </CardTitle>
                  <CardDescription>Import multiple users from CSV or Excel file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Template Download */}
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Download Template</p>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download CSV Template
                    </Button>
                  </div>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleBulkImport}
                      className="hidden"
                      id="bulk-import"
                    />
                    <label htmlFor="bulk-import" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium">Drag and drop your file here</p>
                      <p className="text-sm text-muted-foreground">or click to select CSV/Excel file</p>
                    </label>
                  </div>

                  {/* Import Format Info */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Expected CSV Format:</p>
                    <div className="bg-muted p-3 rounded text-sm font-mono text-muted-foreground overflow-x-auto">
                      Name,Email,Role,Grade Level
                      <br />
                      John Doe,john@school.edu,student,8
                      <br />
                      Jane Smith,jane@school.edu,parent,
                    </div>
                  </div>

                  <Button className="w-full">Import Users</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
