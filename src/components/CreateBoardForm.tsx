import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreateBoardMutation } from '~/queries'
import { useSession } from '~/lib/auth-client'
import { SaveButton } from './SaveButton'

interface CreateBoardFormProps {
  onClose?: () => void
}

export function CreateBoardForm({ onClose }: CreateBoardFormProps) {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#e0e0e0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const createBoardMutation = useCreateBoardMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!name.trim()) {
      setError('Board name is required')
      setIsLoading(false)
      return
    }

    if (!session?.user?.id) {
      setError('You must be logged in to create a board')
      setIsLoading(false)
      return
    }

    try {
      const boardId = await createBoardMutation.mutateAsync({
        name: name.trim(),
        color,
        authUserId: session.user.id,
      })

      // Navigate to the new board
      navigate({ to: '/boards/$boardId', params: { boardId } })
      onClose?.()
    } catch (err) {
      setError('Failed to create board. Please try again.')
      console.error('Board creation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const colorOptions = [
    '#e0e0e0', // Gray
    '#fee2e2', // Red
    '#fef3c7', // Yellow
    '#d1fae5', // Green
    '#dbeafe', // Blue
    '#e0e7ff', // Indigo
    '#f3e8ff', // Purple
    '#fce7f3', // Pink
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Create New Board</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="boardName" className="block text-sm font-medium text-gray-700 mb-1">
            Board Name
          </label>
          <input
            id="boardName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter board name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Board Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === colorOption ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: colorOption }}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <SaveButton type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? 'Creating...' : 'Create Board'}
          </SaveButton>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}