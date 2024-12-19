import { pgTable, serial, timestamp, boolean, varchar, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  isOnline: boolean('is_online').default(false),
  lastOnline: timestamp('last_online', { 
    precision: 6,
    mode: 'string'
  }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { 
    precision: 6,
    mode: 'string'
  }).defaultNow().notNull()
});

export const statusLogs = pgTable('status_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: boolean('status').notNull(),
  createdAt: timestamp('created_at', { 
    precision: 6,
    mode: 'string'
  }).defaultNow().notNull()
}); 