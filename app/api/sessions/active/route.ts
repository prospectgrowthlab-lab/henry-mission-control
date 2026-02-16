import { NextResponse } from 'next/server'
import { getActiveSessions } from '@/lib/usage-parser'

/**
 * GET /api/sessions/active
 *
 * Returns currently active sessions and tasks
 */
export async function GET() {
  try {
    const sessions = await getActiveSessions()

    // Group sessions by status
    const activeSessions = sessions.filter((s) => s.isActive)

    return NextResponse.json({
      count: activeSessions.length,
      sessions: activeSessions.map((session) => ({
        id: session.sessionId,
        model: session.modelId,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        isActive: session.isActive,
        duration: Math.floor(
          (new Date().getTime() - new Date(session.lastActivity).getTime()) /
            1000
        ),
      })),
      maxConcurrent: 4,
      percentageUtilized: (activeSessions.length / 4) * 100,
    })
  } catch (error) {
    console.error('API error in /api/sessions/active:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active sessions' },
      { status: 500 }
    )
  }
}
