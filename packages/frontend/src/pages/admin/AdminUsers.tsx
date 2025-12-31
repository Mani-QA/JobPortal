import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MoreVertical, 
  Mail, 
  Shield, 
  ShieldOff, 
  Trash2, 
  Eye,
  Download,
  UserPlus,
  Building2,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../lib/api';

interface AdminUser {
  id: string;
  email: string;
  role: 'job_seeker' | 'employer' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLogin?: string;
  profile?: {
    name: string;
    companyName?: string;
  };
}

// Mock data for development
const mockUsers: AdminUser[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    role: 'job_seeker',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-12-30T14:22:00Z',
    profile: { name: 'John Doe' },
  },
  {
    id: '2',
    email: 'hr@techcorp.com',
    role: 'employer',
    status: 'active',
    createdAt: '2024-02-20T08:15:00Z',
    lastLogin: '2024-12-31T09:45:00Z',
    profile: { name: 'Sarah Johnson', companyName: 'TechCorp Inc.' },
  },
  {
    id: '3',
    email: 'admin@jobportal.com',
    role: 'admin',
    status: 'active',
    createdAt: '2023-06-01T00:00:00Z',
    lastLogin: '2024-12-31T10:00:00Z',
    profile: { name: 'Platform Admin' },
  },
  {
    id: '4',
    email: 'jane.smith@email.com',
    role: 'job_seeker',
    status: 'suspended',
    createdAt: '2024-03-10T16:45:00Z',
    lastLogin: '2024-11-15T11:30:00Z',
    profile: { name: 'Jane Smith' },
  },
  {
    id: '5',
    email: 'recruiting@startup.io',
    role: 'employer',
    status: 'pending',
    createdAt: '2024-12-28T12:00:00Z',
    profile: { name: 'Mike Chen', companyName: 'StartupXYZ' },
  },
  {
    id: '6',
    email: 'developer@gmail.com',
    role: 'job_seeker',
    status: 'active',
    createdAt: '2024-06-15T09:20:00Z',
    lastLogin: '2024-12-29T16:30:00Z',
    profile: { name: 'Alex Developer' },
  },
  {
    id: '7',
    email: 'careers@bigcorp.com',
    role: 'employer',
    status: 'active',
    createdAt: '2024-04-22T11:00:00Z',
    lastLogin: '2024-12-30T08:15:00Z',
    profile: { name: 'Emily Brown', companyName: 'BigCorp Industries' },
  },
  {
    id: '8',
    email: 'newuser@test.com',
    role: 'job_seeker',
    status: 'pending',
    createdAt: '2024-12-30T20:00:00Z',
    profile: { name: 'New User' },
  },
];

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery, roleFilter, statusFilter, currentPage],
    queryFn: async () => {
      // const { data } = await api.get('/admin/users', {
      //   params: { search: searchQuery, role: roleFilter, status: statusFilter, page: currentPage, limit: 10 }
      // });
      // return data;
      return {
        users: mockUsers,
        total: mockUsers.length,
        page: 1,
        totalPages: 1,
      };
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.put(`/admin/users/${userId}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.put(`/admin/users/${userId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'employer':
        return <Building2 className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (role) {
      case 'employer':
        return 'secondary';
      case 'admin':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Suspended
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <AlertTriangle className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users?.users.map((u) => u.id) || []);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const filteredUsers = users?.users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform users and their permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="job_seeker">Job Seekers</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4 bg-indigo-50 border-indigo-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-700 font-medium">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
                Clear Selection
              </Button>
              <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                <ShieldOff className="w-4 h-4 mr-1" />
                Suspend
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers?.length && filteredUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="w-4 h-4" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="w-32 h-4 mb-1" />
                          <Skeleton className="w-40 h-3" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="w-20 h-6" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-20 h-6" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-32 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-8 h-8 ml-auto" /></td>
                  </tr>
                ))
              ) : (
                filteredUsers?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.profile?.name.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.profile?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.profile?.companyName && (
                            <p className="text-xs text-gray-400">{user.profile.companyName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="inline-flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDateTime(user.lastLogin)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        {actionMenuOpen === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Profile
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Send Email
                            </button>
                            <hr className="my-1" />
                            {user.status === 'active' ? (
                              <button 
                                onClick={() => suspendUserMutation.mutate(user.id)}
                                className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                              >
                                <ShieldOff className="w-4 h-4" />
                                Suspend User
                              </button>
                            ) : (
                              <button 
                                onClick={() => activateUserMutation.mutate(user.id)}
                                className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Activate User
                              </button>
                            )}
                            <button 
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers?.length || 0}</span> of{' '}
            <span className="font-medium">{users?.total || 0}</span> users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Page {currentPage} of {users?.totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(users?.totalPages || 1, currentPage + 1))}
              disabled={currentPage === (users?.totalPages || 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
