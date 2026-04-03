import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { vibrate } from '../lib/vibrate'
import type { User } from '../lib/types'

type Tab = 'players' | 'defis' | 'truths' | 'dares' | 'quiz' | 'wyr'

interface SimpleItem { id: string; content: string }
interface QuizItem { id: string; question: string; answer_a: string; answer_b: string; answer_c: string; answer_d: string; correct: number }
interface WyrItem { id: string; option_a: string; option_b: string }
interface DefiItem { id: string; content: string; status: string; proposed_by: string; proposer_name?: string }

export default function AdminContent({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('players')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'players', label: '👥 Joueurs' },
    { key: 'defis', label: '🎯 Défis Vincent' },
    { key: 'truths', label: '🤔 Vérités' },
    { key: 'dares', label: '🎬 Actions' },
    { key: 'quiz', label: '🧠 Quiz' },
    { key: 'wyr', label: '🤷 Tu préfères' },
  ]

  return (
    <div className="min-h-dvh px-4 py-6 pb-20">
      <button onClick={onBack} className="text-gray-400 text-2xl mb-4">←</button>
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold gradient-text">Contenu des jeux</h1>
      </div>

      <div className="mb-6">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          className="w-full px-4 py-3 rounded-xl bg-dark-light text-white border border-dark-lighter focus:border-accent focus:outline-none text-sm font-bold appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
        >
          {tabs.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>

      {tab === 'players' && <PlayersList />}
      {tab === 'defis' && <DefisList />}
      {tab === 'truths' && <SimpleList table="truths" placeholder="Ex: Ton plus gros secret ?" />}
      {tab === 'dares' && <SimpleList table="dares" placeholder="Ex: Danse 30 secondes" />}
      {tab === 'quiz' && <QuizList />}
      {tab === 'wyr' && <WyrList />}
    </div>
  )
}

// ============ Players list ============
function PlayersList() {
  const [players, setPlayers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')

  const fetchPlayers = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at')
    if (data) setPlayers(data as User[])
    setLoading(false)
  }

  useEffect(() => { fetchPlayers() }, [])

  const addPlayer = async () => {
    const name = newName.trim()
    if (!name) return
    vibrate()
    const username = name.toLowerCase().replace(/\s+/g, '-')
    await supabase.from('users').insert({
      username,
      display_name: name,
      score: 0,
      is_admin: false,
      is_target: false,
      has_submitted_challenges: false,
    })
    setNewName('')
    fetchPlayers()
  }

  const removePlayer = async (player: User) => {
    if (player.is_admin || player.is_target) return
    vibrate()
    await supabase.from('users').delete().eq('id', player.id)
    fetchPlayers()
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          placeholder="Prénom du joueur..."
          className="flex-1 px-3 py-3 rounded-xl bg-dark-light text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-sm"
        />
        <button onClick={addPlayer} disabled={!newName.trim()} className="px-4 py-3 rounded-xl gradient-bg text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-30">+</button>
      </div>
      {loading ? <p className="text-gray-500 text-center text-sm">Chargement...</p> : (
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.id} className={`card flex items-center gap-3 py-3 ${p.is_admin ? 'border-yellow-500/30' : p.is_target ? 'border-purple-500/30' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-dark-lighter flex items-center justify-center overflow-hidden flex-shrink-0">
                {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{p.is_target ? '👑' : p.is_admin ? '🎮' : '😎'}</span>}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{p.display_name}</p>
                <p className="text-xs text-gray-500">{p.is_admin ? 'Raph' : p.is_target ? 'Le marié' : 'Joueur'}{p.score > 0 && ` — ${p.score} pts`}</p>
              </div>
              {!p.is_admin && !p.is_target && <button onClick={() => removePlayer(p)} className="text-red-400 text-lg flex-shrink-0 active:scale-90">✕</button>}
            </div>
          ))}
          <p className="text-gray-600 text-xs text-center mt-2">{players.length} joueur{players.length > 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}

// ============ Défis Vincent ============
function DefisList() {
  const [defis, setDefis] = useState<DefiItem[]>([])
  const [players, setPlayers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newDefi, setNewDefi] = useState('')
  const [assignTo, setAssignTo] = useState('')

  const fetchDefis = async () => {
    const { data } = await supabase
      .from('vincent_challenges')
      .select('*, users!vincent_challenges_proposed_by_fkey(display_name)')
      .order('created_at', { ascending: false })
    if (data) {
      setDefis(data.map((c) => ({
        ...c,
        proposer_name: (c.users as { display_name: string } | null)?.display_name ?? '?',
      })))
    }
    setLoading(false)
  }

  const fetchPlayers = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at')
    if (data) setPlayers(data as User[])
  }

  useEffect(() => { fetchDefis(); fetchPlayers() }, [])

  const addDefi = async () => {
    const text = newDefi.trim()
    if (!text || !assignTo) return
    vibrate()
    await supabase.from('vincent_challenges').insert({ proposed_by: assignTo, content: text })
    setNewDefi('')
    fetchDefis()
  }

  const removeDefi = async (id: string) => {
    vibrate()
    await supabase.from('vincent_challenges').delete().eq('id', id)
    fetchDefis()
  }

  const toggleStatus = async (defi: DefiItem) => {
    vibrate()
    const next = defi.status === 'pending' ? 'completed' : defi.status === 'completed' ? 'failed' : 'pending'
    await supabase.from('vincent_challenges').update({ status: next }).eq('id', defi.id)
    fetchDefis()
  }

  const statusIcon = (s: string) => s === 'completed' ? '✅' : s === 'failed' ? '❌' : '⏳'
  const nonTargetPlayers = players.filter((p) => !p.is_target)

  return (
    <div>
      <div className="card mb-4 space-y-2">
        <input
          type="text"
          value={newDefi}
          onChange={(e) => setNewDefi(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addDefi()}
          placeholder="Défi pour Vincent..."
          className="w-full px-3 py-2 rounded-lg bg-dark text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-sm"
        />
        <select
          value={assignTo}
          onChange={(e) => setAssignTo(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-dark text-white border border-dark-lighter focus:border-accent focus:outline-none text-sm appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          <option value="">Proposé par...</option>
          {nonTargetPlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.display_name}</option>
          ))}
        </select>
        <button onClick={addDefi} disabled={!newDefi.trim() || !assignTo} className="w-full py-2 rounded-lg gradient-bg text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-30">
          + Ajouter un défi
        </button>
      </div>

      {loading ? <p className="text-gray-500 text-center text-sm">Chargement...</p> : (
        <div className="space-y-2">
          {defis.map((d) => (
            <div key={d.id} className={`card flex items-center gap-3 py-3 ${
              d.status === 'completed' ? 'border-green-500/30 bg-green-900/10' :
              d.status === 'failed' ? 'border-red-500/30 bg-red-900/10' : ''
            }`}>
              <button onClick={() => toggleStatus(d)} className="text-xl flex-shrink-0 active:scale-90">
                {statusIcon(d.status)}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${d.status !== 'pending' ? 'line-through text-gray-500' : ''}`}>{d.content}</p>
                <p className="text-xs text-gray-600 mt-0.5">par {d.proposer_name}</p>
              </div>
              <button onClick={() => removeDefi(d.id)} className="text-red-400 text-lg flex-shrink-0 active:scale-90">✕</button>
            </div>
          ))}
          {defis.length === 0 && <p className="text-gray-500 text-center text-sm">Aucun défi</p>}
          <p className="text-gray-600 text-xs text-center mt-2">{defis.length} défi{defis.length > 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}

// ============ Simple list (truths / dares) ============
function SimpleList({ table, placeholder }: { table: string; placeholder: string }) {
  const [items, setItems] = useState<SimpleItem[]>([])
  const [newText, setNewText] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    const { data } = await supabase.from(table).select('id, content').order('created_at')
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [table]) // eslint-disable-line react-hooks/exhaustive-deps

  const add = async () => {
    const text = newText.trim()
    if (!text) return
    vibrate()
    await supabase.from(table).insert({ content: text })
    setNewText('')
    fetchItems()
  }

  const remove = async (id: string) => {
    vibrate()
    await supabase.from(table).delete().eq('id', id)
    fetchItems()
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input type="text" value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={placeholder}
          className="flex-1 px-3 py-3 rounded-xl bg-dark-light text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-sm" />
        <button onClick={add} disabled={!newText.trim()} className="px-4 py-3 rounded-xl gradient-bg text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-30">+</button>
      </div>
      {loading ? <p className="text-gray-500 text-center text-sm">Chargement...</p> : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-3 py-3">
              <p className="flex-1 text-sm">{item.content}</p>
              <button onClick={() => remove(item.id)} className="text-red-400 text-lg flex-shrink-0 active:scale-90">✕</button>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-500 text-center text-sm">Aucun contenu</p>}
          <p className="text-gray-600 text-xs text-center mt-2">{items.length} item{items.length > 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}

// ============ Quiz list ============
function QuizList() {
  const [items, setItems] = useState<QuizItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [c, setC] = useState('')
  const [d, setD] = useState('')
  const [correct, setCorrect] = useState(0)

  const fetchItems = async () => {
    const { data } = await supabase.from('quiz_questions').select('*').order('created_at')
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const add = async () => {
    if (!q.trim() || !a.trim() || !b.trim() || !c.trim() || !d.trim()) return
    vibrate()
    await supabase.from('quiz_questions').insert({ question: q.trim(), answer_a: a.trim(), answer_b: b.trim(), answer_c: c.trim(), answer_d: d.trim(), correct })
    setQ(''); setA(''); setB(''); setC(''); setD(''); setCorrect(0); setShowForm(false)
    fetchItems()
  }

  const remove = async (id: string) => {
    vibrate()
    await supabase.from('quiz_questions').delete().eq('id', id)
    fetchItems()
  }

  const answers = [a, b, c, d]
  const labels = ['A', 'B', 'C', 'D']
  const setters = [setA, setB, setC, setD]

  return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl gradient-bg text-white font-bold text-sm active:scale-95 transition-transform mb-4">+ Ajouter une question</button>
      ) : (
        <div className="card mb-4 space-y-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Question..."
            className="w-full px-3 py-2 rounded-lg bg-dark text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-sm" />
          {labels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => setCorrect(i)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${correct === i ? 'bg-green-600 text-white' : 'bg-dark-lighter text-gray-500'}`}>{label}</button>
              <input value={answers[i]} onChange={(e) => setters[i](e.target.value)} placeholder={`Réponse ${label}...`}
                className="flex-1 px-3 py-2 rounded-lg bg-dark text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-sm" />
            </div>
          ))}
          <p className="text-xs text-gray-500">Clique sur la lettre pour marquer la bonne réponse (vert)</p>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-dark-lighter text-gray-400 font-bold text-sm">Annuler</button>
            <button onClick={add} className="flex-1 py-2 rounded-lg gradient-bg text-white font-bold text-sm active:scale-95 transition-transform">Ajouter</button>
          </div>
        </div>
      )}
      {loading ? <p className="text-gray-500 text-center text-sm">Chargement...</p> : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="card py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1">{item.question}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {[item.answer_a, item.answer_b, item.answer_c, item.answer_d].map((ans, i) => (
                      <p key={i} className={`text-xs px-2 py-1 rounded ${i === item.correct ? 'bg-green-900/30 text-green-400' : 'text-gray-500'}`}>{labels[i]}. {ans}</p>
                    ))}
                  </div>
                </div>
                <button onClick={() => remove(item.id)} className="text-red-400 text-lg flex-shrink-0 active:scale-90">✕</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-500 text-center text-sm">Aucune question</p>}
          <p className="text-gray-600 text-xs text-center mt-2">{items.length} question{items.length > 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}

// ============ Would You Rather list ============
function WyrList() {
  const [items, setItems] = useState<WyrItem[]>([])
  const [loading, setLoading] = useState(true)
  const [optA, setOptA] = useState('')
  const [optB, setOptB] = useState('')

  const fetchItems = async () => {
    const { data } = await supabase.from('would_you_rather').select('*').order('created_at')
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const add = async () => {
    if (!optA.trim() || !optB.trim()) return
    vibrate()
    await supabase.from('would_you_rather').insert({ option_a: optA.trim(), option_b: optB.trim() })
    setOptA(''); setOptB('')
    fetchItems()
  }

  const remove = async (id: string) => {
    vibrate()
    await supabase.from('would_you_rather').delete().eq('id', id)
    fetchItems()
  }

  return (
    <div>
      <div className="card mb-4 space-y-2">
        <input value={optA} onChange={(e) => setOptA(e.target.value)} placeholder="Option A..."
          className="w-full px-3 py-2 rounded-lg bg-dark text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-sm" />
        <input value={optB} onChange={(e) => setOptB(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Option B..."
          className="w-full px-3 py-2 rounded-lg bg-dark text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-sm" />
        <button onClick={add} disabled={!optA.trim() || !optB.trim()} className="w-full py-2 rounded-lg gradient-bg text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-30">+ Ajouter</button>
      </div>
      {loading ? <p className="text-gray-500 text-center text-sm">Chargement...</p> : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-3 py-3">
              <div className="flex-1 text-sm">
                <span className="text-purple-400">A.</span> {item.option_a}
                <span className="text-gray-600 mx-2">ou</span>
                <span className="text-pink-400">B.</span> {item.option_b}
              </div>
              <button onClick={() => remove(item.id)} className="text-red-400 text-lg flex-shrink-0 active:scale-90">✕</button>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-500 text-center text-sm">Aucun contenu</p>}
          <p className="text-gray-600 text-xs text-center mt-2">{items.length} item{items.length > 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
