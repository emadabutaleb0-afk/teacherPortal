import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserAccount } from '@/lib/mockData';
import { Plus, Edit2, Trash2, Link2, Users, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function AdminUsers() {
  const { user, getAllUsers, updateUser, deleteUser, linkParentToStudent } = useAuth();
  const [, navigate] = useLocation();
  const [filterRole, setFilterRole] = useState('all-roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<UserAccount | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserAccount | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'student',
    gradeLevel: '8',
  });

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const allUsers = getAllUsers();
  let filteredUsers = allUsers;

  if (filterRole && filterRole !== 'all-roles') {
    filteredUsers = filteredUsers.filter(u => u.role === filterRole);
  }

  if (searchTerm) {
    filteredUsers = filteredUsers.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddUser = () => {
    if (!newUserForm.name || !newUserForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newUser: UserAccount = {
      id: `${newUserForm.role}-${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role as 'student' | 'parent' | 'admin',
      gradeLevel: newUserForm.role === 'student' ? parseInt(newUserForm.gradeLevel) : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // In a real app, this would be added via the auth context
    toast.success(`User ${newUserForm.name} added successfully!`);
    setNewUserForm({ name: '', email: '', role: 'student', gradeLevel: '8' });
    setIsAddDialogOpen(false);
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateUser(userId, { status: newStatus as 'active' | 'inactive' });
    toast.success(`User status updated to ${newStatus}`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    deleteUser(userId);
    toast.success(`User ${userName} deleted successfully`);
  };

  const handleLinkParentStudent = () => {
    if (!selectedParent || !selectedStudent) {
      toast.error('Please select both a parent and a student');
      return;
    }

    linkParentToStudent(selectedParent.id, selectedStudent.id);
    toast.success(`${selectedParent.name} linked to ${selectedStudent.name}`);
    setIsLinkDialogOpen(false);
    setSelectedParent(null);
    setSelectedStudent(null);
  };

  const parents = allUsers.filter(u => u.role === 'parent');
  const students = allUsers.filter(u => u.role === 'student');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users on the platform</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-primary text-primary hover:bg-primary/5"
              onClick={() => navigate('/admin/advanced-users')}
            >
              <Shield className="w-4 h-4" />
              Adv Users
            </Button>

            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Link Parent to Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link Parent to Student</DialogTitle>
                  <DialogDescription>
                    Connect a parent account to a student account for monitoring
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Parent</Label>
                    <Select
                      value={selectedParent?.id || ''}
                      onValueChange={(id) => {
                        const parent = parents.find(p => p.id === id);
                        setSelectedParent(parent || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Student</Label>
                    <Select
                      value={selectedStudent?.id || ''}
                      onValueChange={(id) => {
                        const student = students.find(s => s.id === id);
                        setSelectedStudent(student || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} (Grade {s.gradeLevel})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleLinkParentStudent} className="w-full">
                    Link Accounts
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account on the platform</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={newUserForm.role}
                      onValueChange={(role) => setNewUserForm({ ...newUserForm, role })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newUserForm.role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade Level</Label>
                      <Select
                        value={newUserForm.gradeLevel}
                        onValueChange={(grade) => setNewUserForm({ ...newUserForm, gradeLevel: grade })}
                      >
                        <SelectTrigger id="grade">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 9 }, (_, i) => i + 4).map(grade => (
                            <SelectItem key={grade} value={grade.toString()}>
                              Grade {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button onClick={handleAddUser} className="w-full">
                    Create User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Filter by Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-roles">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterRole('all-roles');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid Table */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-4 px-6 font-semibold">User</th>
                    <th className="text-left py-4 px-6 font-semibold">Email</th>
                    <th className="text-left py-4 px-6 font-semibold">Role</th>
                    <th className="text-left py-4 px-6 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 font-semibold">Grade</th>
                    <th className="text-left py-4 px-6 font-semibold">Created</th>
                    <th className="text-right py-4 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      {/* Name with Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-foreground">{u.name}</span>
                        </div>
                      </td>
                      
                      {/* Email */}
                      <td className="py-4 px-6 text-muted-foreground">{u.email}</td>
                      
                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <Badge variant={u.role === 'admin' ? 'default' : u.role === 'parent' ? 'secondary' : 'outline'}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </Badge>
                      </td>
                      
                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <Badge variant={u.status === 'active' ? 'default' : 'destructive'}>
                          {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                        </Badge>
                      </td>
                      
                      {/* Grade Level */}
                      <td className="py-4 px-6">
                        {u.gradeLevel ? (
                          <Badge variant="outline">Grade {u.gradeLevel}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      
                      {/* Created At */}
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      
                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className="text-xs h-8"
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8"
                            onClick={() => {
                              if (u.role === 'student') {
                                setSelectedStudent(u);
                                setIsLinkDialogOpen(true);
                              } else if (u.role === 'parent') {
                                setSelectedParent(u);
                                setIsLinkDialogOpen(true);
                              }
                            }}
                          >
                            <Link2 className="w-3 h-3" />
                            <span className="text-xs">Link</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
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
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No users found matching your filters</p>
              <Button onClick={() => { setFilterRole(''); setSearchTerm(''); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
