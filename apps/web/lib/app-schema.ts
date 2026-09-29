import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

import { user } from "./auth-schema"

export const pluggyConnections = pgTable(
  "pluggy_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull().unique(),
    institutionName: text("institution_name").notNull(),
    institutionLogo: text("institution_logo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdUnique: uniqueIndex("pluggy_connections_user_id_unique").on(
      table.userId,
    ),
  }),
)

export const appSchema = { pluggyConnections }
