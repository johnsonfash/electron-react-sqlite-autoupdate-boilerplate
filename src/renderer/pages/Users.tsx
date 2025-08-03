import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { prisma } from '../utils/prisma';

type User = {
  name: string;
  id: string;
  email: string;
  role: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await prisma.users.findMany();
      console.log('data', data)
      setUsers(data);
    } catch (e) {
      console.log(e)
      toast.error('Failed to fetch users');
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
            </tr>
          </thead>
          <tbody>
            {users?.length && users.map((u) => (
              <tr key={u.id}>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
