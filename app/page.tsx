import { db } from './db';
import { users, statusLogs } from './db/schema';
import { desc, eq } from 'drizzle-orm';
import StatusToggle from './components/statusToggle';
import type { InferModel } from 'drizzle-orm';

type StatusLog = InferModel<typeof statusLogs>;
type DbUser = InferModel<typeof users>;
type User = DbUser & { latestStatus?: StatusLog };

type UserWithStatus = Omit<User, 'currentStatus'> & {
  currentStatus: boolean;
};

async function getLatestStatusForUsers(): Promise<UserWithStatus[]> {
  try {
    console.log('Fetching users...');
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(users.name);
    console.log('Found users:', allUsers.length);
    
    const usersWithStatus = await Promise.all(
      allUsers.map(async (user: DbUser) => {
        const latestStatus = await db
          .select()
          .from(statusLogs)
          .where(eq(statusLogs.userId, user.id))
          .orderBy(desc(statusLogs.createdAt))
          .limit(1);

        return {
          ...user,
          currentStatus: user.isOnline ?? false,
          lastOnline: user.lastOnline,
          latestStatus: latestStatus[0],
        } satisfies UserWithStatus & { currentStatus: boolean };
      })
    );

    return usersWithStatus;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export const dynamic = 'force-dynamic';

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
                      : `⚫ Last online: ${user.lastOnline instanceof Date && !isNaN(user.lastOnline.getTime())
                          ? new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            }).format(user.lastOnline)
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
