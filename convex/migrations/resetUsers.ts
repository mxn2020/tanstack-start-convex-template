// Migration to reset users table for new schema
import { internalMutation } from '../_generated/server'

export const resetUsersTable = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query('users').collect()
    
    // Delete all existing users
    for (const user of users) {
      await ctx.db.delete(user._id)
    }
    
    console.log(`Deleted ${users.length} users from the database`)
    return { deletedCount: users.length }
  },
})