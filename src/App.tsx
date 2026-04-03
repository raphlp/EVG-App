import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import type { User, Room, Page } from './lib/types'
import Welcome from './components/Welcome'
import Login from './components/Login'
import Home from './components/Home'
import TruthDare from './components/TruthDare'
import Challenges from './components/Challenges'
import Quiz from './components/Quiz'
import Scoreboard from './components/Scoreboard'
import WouldYouRather from './components/WouldYouRather'
import AdminPanel from './components/AdminPanel'
import AdminContent from './components/AdminContent'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [page, setPage] = useState<Page>('home')
  const [welcomed, setWelcomed] = useState(() => !!localStorage.getItem('evg-user'))
  const [showAdmin, setShowAdmin] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [inQuiz, setInQuiz] = useState(false)
  const quizTriggered = useRef(false)
  const loginTime = useRef(0) // guard against false wipe detection after login

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('evg-user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        supabase.from('users').select('*').eq('id', parsed.id).single()
          .then(({ data }) => {
            if (data) {
              setUser(data as User)
              loginTime.current = Date.now()
            } else {
              localStorage.removeItem('evg-user')
            }
          })
      } catch {
        localStorage.removeItem('evg-user')
      }
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('score', { ascending: false })
    if (data) setUsers(data as User[])
  }, [])

  const fetchRoom = useCallback(async () => {
    const { data } = await supabase.from('room').select('*').single()
    if (data) setRoom(data as Room)
  }, [])

  useEffect(() => {
    if (!user) return

    fetchUsers()
    fetchRoom()

    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers()
      })
      .subscribe()

    const roomChannel = supabase
      .channel('room-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room' }, () => {
        fetchRoom()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(roomChannel)
    }
  }, [user, fetchUsers, fetchRoom])

  // Detect forced logout via session_version change
  useEffect(() => {
    if (!room || !room.session_version) return
    const storedVersion = localStorage.getItem('evg-session-version')
    const current = String(room.session_version)
    if (storedVersion && storedVersion !== current) {
      setUser(null)
      localStorage.removeItem('evg-user')
      localStorage.setItem('evg-session-version', current)
      setPage('home')
      return
    }
    localStorage.setItem('evg-session-version', current)
  }, [room])

  // Sync local user with DB + detect admin reset
  // Skip wipe detection for 5s after login to avoid race conditions
  useEffect(() => {
    if (!user || users.length === 0) return
    const updated = users.find((u) => u.id === user.id)
    if (!updated) return

    const justLoggedIn = Date.now() - loginTime.current < 10000

    if (!justLoggedIn) {
      // Detect reset total: avatar wiped or challenges wiped
      const avatarWiped = user.avatar_url && !updated.avatar_url
      const challengesWiped = user.has_submitted_challenges && !updated.has_submitted_challenges && !user.is_target
      if (avatarWiped || challengesWiped) {
        setUser(null)
        localStorage.removeItem('evg-user')
        setPage('home')
        return
      }
    }

    if (updated.score !== user.score || updated.avatar_url !== user.avatar_url || updated.has_submitted_challenges !== user.has_submitted_challenges) {
      setUser(updated)
      localStorage.setItem('evg-user', JSON.stringify(updated))
    }
  }, [users, user])

  const handleLogin = async (loggedUser: User) => {
    loginTime.current = Date.now()
    // Sync session version at login to prevent false logout detection
    const { data: currentRoom } = await supabase.from('room').select('session_version').single()
    if (currentRoom?.session_version) {
      localStorage.setItem('evg-session-version', String(currentRoom.session_version))
    }
    setUser(loggedUser)
    localStorage.setItem('evg-user', JSON.stringify(loggedUser))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('evg-user')
    setPage('home')
    setShowAdmin(false)
    setWelcomed(false)
  }

  const handleScoreUser = async (userId: string, points: number) => {
    const targetUser = users.find((u) => u.id === userId)
    if (!targetUser) return
    const newScore = Math.max(0, targetUser.score + points)
    await supabase.from('users').update({ score: newScore }).eq('id', userId)

    if (room) {
      const { data: allUsers } = await supabase.from('users').select('score')
      if (allUsers) {
        const totalPoints = allUsers.reduce((sum, u) => sum + (u.score || 0), 0)
        const maxPossible = Math.max(totalPoints + 100, 500)
        const progress = Math.min(100, Math.round((totalPoints / maxPossible) * 100))
        await supabase
          .from('room')
          .update({ total_points: totalPoints, progress_percentage: progress })
          .eq('id', room.id)
      }
    }
  }

  const handleScore = async (points: number) => {
    if (!user) return
    await handleScoreUser(user.id, points)
  }

  const goBack = async () => {
    await supabase
      .from('room')
      .update({
        current_game: 'idle',
        current_card: null,
        current_card_type: null,
        current_card_target: null,
        current_challenge_id: null,
      })
      .eq('name', 'EVG Vincent')
    setPage('home')
  }

  // --- Welcome splash ---
  if (!user && !welcomed) {
    return <Welcome onStart={() => setWelcomed(true)} />
  }

  // --- Not logged in ---
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // --- Admin content editor ---
  if (showContent && user.is_admin) {
    return <AdminContent onBack={() => setShowContent(false)} />
  }

  // --- Admin panel ---
  if (showAdmin && user.is_admin) {
    return (
      <AdminPanel
        user={user}
        onClose={() => setShowAdmin(false)}
        onLogout={handleLogout}
        onContent={() => { setShowAdmin(false); setShowContent(true) }}
      />
    )
  }

  // =============================================
  // NON-ADMIN: follow room.current_game automatically
  // =============================================
  if (!user.is_admin) {
    const currentGame = room?.current_game

    if (currentGame === 'quiz' && !quizTriggered.current) {
      quizTriggered.current = true
      setInQuiz(true)
    }

    if (inQuiz) {
      return <Quiz onBack={() => { setInQuiz(false); quizTriggered.current = false }} onScore={handleScore} />
    }

    if (currentGame === 'truth-dare') {
      return <TruthDare user={user} room={room} onBack={() => {}} />
    }

    if (currentGame === 'challenge') {
      return <Challenges user={user} room={room} onBack={() => {}} onScore={handleScoreUser} />
    }

    if (currentGame === 'wyr') {
      return <WouldYouRather user={user} room={room} onBack={() => {}} />
    }

    return (
      <Scoreboard
        users={users}
        currentUser={user}
        room={room}
        onBack={handleLogout}
        isHome
      />
    )
  }

  // =============================================
  // ADMIN (Raph): menu with game controls
  // =============================================
  switch (page) {
    case 'truth-dare':
      return <TruthDare user={user} room={room} onBack={goBack} />
    case 'challenges':
      return <Challenges user={user} room={room} onBack={goBack} onScore={handleScoreUser} />
    case 'quiz':
      return <Quiz onBack={goBack} onScore={handleScore} />
    case 'wyr':
      return <WouldYouRather user={user} room={room} onBack={goBack} />
    case 'scoreboard':
      return <Scoreboard users={users} currentUser={user} onBack={goBack} />
    default:
      return (
        <Home
          user={user}
          room={room}
          onNavigate={setPage}
          onLogout={handleLogout}
          onAdmin={() => setShowAdmin(true)}
        />
      )
  }
}
