import { db } from './db';
import { users, statusLogs } from './db/schema';
import { desc, eq } from 'drizzle-orm';
import StatusToggle from './components/statusToggle';

type User = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
};

type UserWithStatus = User & {
  currentStatus: boolean;
  lastOnline: Date | null;
};

async function getLatestStatusForUsers(): Promise<UserWithStatus[]> {
  try {
    console.log('Fetching users...');
    const allUsers = await db.select().from(users);
    console.log('Found users:', allUsers.length);
    
    // Get latest status for each user
    const usersWithStatus = await Promise.all(
      allUsers.map(async (user: User) => {
        const latestStatus = await db
          .select()
          .from(statusLogs)
          .where(eq(statusLogs.userId, user.id))
          .orderBy(desc(statusLogs.createdAt))
          .limit(1);

        return {
          ...user,
          currentStatus: latestStatus[0]?.status ?? false,
          lastOnline: latestStatus[0]?.createdAt
        };
      })
    );

    return usersWithStatus;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export default async function Home() {
  let usersWithStatus: UserWithStatus[] = [];
  let error = null;

  try {
    usersWithStatus = await getLatestStatusForUsers();
  } catch (e) {
    error = e;
    console.error('Error in Home component:', e);
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <main className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-500">Error loading users</h1>
          <p className="mt-2">Please check your database connection</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Team Status Board</h1>
        
        {usersWithStatus.length === 0 ? (
          <p className="text-gray-500">No users found. Add some users to get started.</p>
        ) : (
          <div className="divide-y">
            {usersWithStatus.map((user: UserWithStatus) => (
              <div key={user.id} className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-500">
                    {user.currentStatus 
                      ? '🟢 Online now' 
                      : `⚫ Last online: ${user.lastOnline 
                          ? new Intl.DateTimeFormat('default', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }).format(new Date(user.lastOnline))
                          : 'Never'}`
                    }
                  </p>
                </div>
                <StatusToggle 
                  userId={user.id} 
                  initialStatus={user.currentStatus}
                  key={`toggle-${user.id}-${user.currentStatus}`}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
