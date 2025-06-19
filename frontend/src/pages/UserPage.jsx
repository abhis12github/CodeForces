import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Download, Plus, MoreHorizontal, UserPlus, Users, Loader2, AlertCircle } from "lucide-react";
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

// Codeforces rank colors mapping
const rankColors = {
    'newbie': 'bg-gray-500',
    'pupil': 'bg-green-500',
    'specialist': 'bg-cyan-500',
    'expert': 'bg-blue-500',
    'candidate master': 'bg-purple-500',
    'master': 'bg-orange-500',
    'international master': 'bg-orange-600',
    'grandmaster': 'bg-red-500',
    'international grandmaster': 'bg-red-600',
    'legendary grandmaster': 'bg-red-700'
};

const getRankColor = (rank) => {
    return rankColors[rank?.toLowerCase()] || 'bg-gray-400';
};


export const UserPage = () => {

    const navigate=useNavigate();
    
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newUserHandle, setNewUserHandle] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);

    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [updateUserHandle, setUpdateUserHandle] = useState('');
    const [updateUserEmail, setUpdateUserEmail] = useState('');
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('http://localhost:4000/api/v1/users');
            if (!response.statusText == "OK") {
                throw new Error('Failed to fetch users');
            }
            console.log("user data is", response.data.users);
            const data = response.data.users;
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            setError('Failed to load users. Please check if the server is running.');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on handle
    useEffect(() => {
        const filtered = users.filter(user =>
            user.handle?.toLowerCase().includes(filterText.toLowerCase()) ||
            user.name?.toLowerCase().includes(filterText.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [filterText, users]);

    // Load users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Add new user
    const handleAddUser = async () => {
        if (!newUserHandle.trim()) return;

        try {
            setIsAddingUser(true);
            const response = await axios.post('http://localhost:4000/api/v1/users', {
                handle: newUserHandle.trim()
            });

            if (!response.statusText == "OK") {
                throw new Error('Failed to add user');
            }

            await fetchUsers(); // Refresh the users list
            setNewUserHandle('');
            setIsAddDialogOpen(false);
        } catch (err) {
            setError('Failed to add user. Please try again.');
            console.error('Error adding user:', err);
        } finally {
            setIsAddingUser(false);
        }
    };

    const handleOpenUpdateDialog = (user) => {
        setSelectedUser(user);
        setUpdateUserHandle(user.handle);
        setUpdateUserEmail(user.email || '');
        setIsUpdateDialogOpen(true);
    };
    // update user
    const handleUpdateUser = async () => {
        if (!updateUserHandle.trim() && !updateUserEmail.trim()) return;

        try {
            setIsUpdatingUser(true);
            const response = await axios.put(`http://localhost:4000/api/v1/users/${selectedUser.handle}`, {
                handle: updateUserHandle.trim(),
                email: updateUserEmail.trim() || undefined
            });

            if (!response.statusText == "OK") {
                throw new Error('Failed to update user');
            }

            await fetchUsers(); // Refresh the users list
            setIsUpdateDialogOpen(false);
            setSelectedUser(null);
            setUpdateUserHandle('');
            setUpdateUserEmail('');
        } catch (err) {
            setError('Failed to update user. Please try again.');
            console.error('Error updating user:', err);
        } finally {
            setIsUpdatingUser(false);
        }
    };

    // Delete user
    const handleDeleteUser = async (userHandle) => {
        try {
            const response = await axios.delete(`http://localhost:4000/api/v1/users/${userHandle}`);

            if (!response.statusText == 'OK') {
                throw new Error('Failed to delete user');
            }

            await fetchUsers(); // Refresh the users list
        } catch (err) {
            setError('Failed to delete user. Please try again.');
            console.error('Error deleting user:', err);
        }
    };

    // Export as CSV
    const handleExportCSV = () => {
        const headers = ['Handle', 'Name', 'Email', 'Rank', 'Rating', 'Max Rating', 'Last Synced On'];
        const csvContent = [
            headers.join(','),
            ...filteredUsers.map(user => [
                user.handle || '',
                user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '',
                user.email || '',
                user.rank || '',
                user.rating || '',
                user.maxRating || '',
                user.lastSyncTime
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codeforces_users.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-8 border-gray-200 dark:border-[#232424] border-[1.5px] rounded-xl m-10 flex flex-col gap-8 min-h-screen">
                <div className="flex flex-col gap-2">
                    <span className="capriola-font text-4xl font-semibold">Welcome Back!</span>
                    <p className="capriola-font text-md text-gray-600 dark:text-white/70">Loading users from Codeforces...</p>
                </div>
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    

    return (
        <div className="p-8 border-gray-200 dark:border-[#232424] border-[1.5px] rounded-xl m-10 flex flex-col gap-8 min-h-screen">
            <div className="flex flex-col gap-2">
                <span className="capriola-font text-4xl font-semibold">Welcome Back!</span>
                <p className="capriola-font text-md text-gray-600 dark:text-white/70">
                    Here is a list of users tracked from Codeforces.
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="w-full flex justify-between items-center gap-2">
                <div>
                    <Input
                        placeholder="Filter handles or names..."
                        className="max-w-sm"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription>
                                    Enter the Codeforces handle of the user you want to track.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    placeholder="Enter handle (e.g., tourist, Errichto)"
                                    value={newUserHandle}
                                    onChange={(e) => setNewUserHandle(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddUser}
                                    disabled={!newUserHandle.trim() || isAddingUser}
                                >
                                    {isAddingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Add User
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleExportCSV} disabled={filteredUsers.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export as CSV
                    </Button>
                </div>
            </div>

            {filteredUsers.length === 0 && !loading ? (
                <div className="rounded-xl border-gray-200 dark:border-[#232424] border-[1.5px] px-8 py-16 flex flex-col items-center justify-center gap-4">
                    <Users className="h-16 w-16 text-gray-400" />
                    <div className="text-center">
                        <h3 className="capriola-font text-xl font-semibold mb-2">
                            {users.length === 0 ? 'No users added yet' : 'No users match your filter'}
                        </h3>
                        <p className="text-gray-600 dark:text-white/70 mb-6">
                            {users.length === 0
                                ? 'Add your first Codeforces user to get started with tracking their progress.'
                                : 'Try adjusting your search filter to find users.'
                            }
                        </p>
                        {users.length === 0 && (
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Your First User
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border-gray-200 dark:border-[#232424] border-[1.5px] px-8 py-4 min-h-60 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="capriola-font text-left">Avatar</TableHead>
                                <TableHead className="w-48 text-center capriola-font">Handle</TableHead>
                                <TableHead className="w-48 text-center capriola-font">Name</TableHead>
                                <TableHead className="w-48 text-center capriola-font">Email</TableHead>
                                <TableHead className="w-48 text-center capriola-font">Rank</TableHead>
                                <TableHead className="w-24 text-center capriola-font">Rating</TableHead>
                                <TableHead className="w-24 text-center capriola-font">Max Rating</TableHead>
                                <TableHead className="w-48 text-center capriola-font">Last Synced On</TableHead>
                                <TableHead className="w-48 text-center capriola-font">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user, index) => (
                                <TableRow key={user.id || user.handle || index}>
                                    <TableCell className="font-medium text-center">
                                        <div className="w-10 h-10">
                                            <img
                                                className="rounded-full w-full h-full object-cover"
                                                src={user.avatar || user.titlePhoto || `https://ui-avatars.com/api/?name=${user.handle}&background=random`}
                                                alt={`${user.handle} avatar`}
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${user.handle}&background=random`;
                                                }}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-48 text-center font-normal copper-font">
                                        {user.handle}
                                    </TableCell>
                                    <TableCell className="w-48 text-center font-normal copper-font">
                                        {user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-')}
                                    </TableCell>
                                    <TableCell className="w-48 text-center font-normal copper-font">
                                        {user.email || '-'}
                                    </TableCell>
                                    <TableCell className="w-48 text-center font-normal">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-white text-xs font-medium capriola-font ${getRankColor(user.rank)}`}>
                                                {user.rank || 'unrated'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-24 text-center font-normal copper-font">
                                        {user.rating || '-'}
                                    </TableCell>
                                    <TableCell className=" w-24 text-center font-normal copper-font">
                                        {user.maxRating || '-'}
                                    </TableCell>
                                    <TableCell className=" w-48 text-center font-normal copper-font">
                                        {new Date(user.lastSyncTime).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="w-48 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => navigate(`/profile/${user.handle}`)}>
                                                    View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenUpdateDialog(user)}>
                                                    Update Data
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteUser(user.id || user.handle)}
                                                >
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update User</DialogTitle>
                                                    <DialogDescription>
                                                        Update the handle or email for {selectedUser?.handle}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4 space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Handle</label>
                                                        <Input
                                                            placeholder="Enter new handle"
                                                            value={updateUserHandle}
                                                            onChange={(e) => setUpdateUserHandle(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Email</label>
                                                        <Input
                                                            placeholder="Enter email address"
                                                            type="email"
                                                            value={updateUserEmail}
                                                            onChange={(e) => setUpdateUserEmail(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleUpdateUser}
                                                        disabled={(!updateUserEmail.trim() && !updateUserHandle.trim()) || isUpdatingUser}
                                                    >
                                                        {isUpdatingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                        Update User
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}