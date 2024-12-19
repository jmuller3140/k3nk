import { pgTable, serial, timestamp, boolean, varchar, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  lastOnline: timestamp('last_online'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const statusLogs = pgTable('status_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: boolean('status').notNull(), // true for online, false for offline
  createdAt: timestamp('created_at').defaultNow().notNull()
}); 