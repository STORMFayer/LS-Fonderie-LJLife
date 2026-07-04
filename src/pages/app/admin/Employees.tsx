import { useEffect, useState, type FormEvent } from 'react'
import { Search, RefreshCw, Pencil, Check, X, UserPlus } from 'lucide-react'
import { supabase, type Employee } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const medals = ['🥇', '🥈', '🥉']

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDiscord, setEditDiscord] = useState('')
  const [editRole, setEditRole] = useState<'admin' | 'employe'>('employe')
  const [prixMinerai, setPrixMinerai] = useState(60)

  const [showAdd, setShowAdd] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [discord, setDiscord] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'employe'>('employe')
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const [{ data }, { data: price }] = await Promise.all([
      supabase.from('employees').select('*').order('total_minerais', { ascending: false }),
      supabase.from('prices').select('price').eq('key', 'mineral').single(),
    ])
    setEmployees(data ?? [])
    if (price) setPrixMinerai(price.price)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(e: Employee) {
    setEditingId(e.id)
    setEditDiscord(e.discord ?? '')
    setEditRole(e.role)
  }

  async function saveEdit(id: string) {
    await supabase.rpc('update_employee', { p_id: id, p_discord: editDiscord, p_role: editRole })
    setEditingId(null)
    await load()
  }

  function resetAddForm() {
    setPrenom('')
    setNom('')
    setDiscord('')
    setPassword('')
    setRole('employe')
  }

  async function handleAddEmployee(e: FormEvent) {
    e.preventDefault()
    setAddError(null)
    setAddSuccess(null)

    if (password.length < 8) {
      setAddError('Mot de passe : 8 caractères minimum.')
      return
    }

    setSubmitting(true)

    const { data, error } = await supabase.functions.invoke('create-employee', {
      body: { prenom, nom, discord, password, role },
    })

    setSubmitting(false)

    if (error || !data?.success) {
      setAddError(data?.error ?? error?.message ?? 'Impossible de créer le compte.')
      return
    }

    setAddSuccess(`Compte créé pour ${prenom} ${nom} (${discord}).`)
    resetAddForm()
    await load()
  }

  const filtered = employees.filter((e) =>
    `${e.full_name} ${e.discord ?? ''}`.toLowerCase().includes(query.toLowerCase()),
  )

  const totalMinerais = employees.reduce((s, e) => s + e.total_minerais, 0)
  const totalSalaire = employees.reduce((s, e) => s + e.total_minerais * prixMinerai, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-[1.5px] font-semibold mb-2">Production totale</div>
          <div className="font-display font-black text-2xl text-white">{totalMinerais.toLocaleString('fr-FR')} minerais</div>
        </Card>
        <Card className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-[1.5px] font-semibold mb-2">Masse salariale</div>
          <div className="font-display font-black text-2xl text-gold-light">{totalSalaire.toLocaleString('fr-FR')} $ · {employees.length} employés</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Ajouter un employé</h2>
          <Button size="sm" variant={showAdd ? 'ghost' : 'gold'} onClick={() => setShowAdd((v) => !v)}>
            <UserPlus size={14} /> {showAdd ? 'Fermer' : 'Nouveau compte'}
          </Button>
        </div>

        {showAdd && (
          <form onSubmit={handleAddEmployee} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[2px] text-white/40 font-semibold mb-1.5 block">Prénom</label>
                <input
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[2px] text-white/40 font-semibold mb-1.5 block">Nom</label>
                <input
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[2px] text-white/40 font-semibold mb-1.5 block">Discord</label>
              <input
                required
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="pseudo#0001"
                className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[2px] text-white/40 font-semibold mb-1.5 block">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[2px] text-white/40 font-semibold mb-1.5 block">Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'employe')}
                  className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50"
                >
                  <option value="employe">Employé</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {addError && <p className="text-red-400 text-xs">{addError}</p>}
            {addSuccess && <p className="text-emerald-400 text-xs">{addSuccess}</p>}

            <Button type="submit" variant="gold" disabled={submitting} className="w-full sm:w-auto sm:self-start">
              <UserPlus size={14} /> {submitting ? 'Création...' : 'Créer le compte'}
            </Button>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un employé..."
              className="w-full rounded-lg bg-white/5 border border-white/12 pl-9 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <Button size="sm" variant="ghost" onClick={load}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((e, i) => (
            <div key={e.id} className="rounded-xl bg-white/[0.03] p-3">
              <div className="flex items-center gap-3">
                <div className="w-7 text-center font-bold text-sm text-white/50">{medals[i] ?? i + 1}</div>
                <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {e.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{e.full_name}</div>
                  <div className="text-white/30 text-xs">{e.discord ?? '—'} · {e.role}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-white text-sm font-bold">{e.total_minerais.toLocaleString('fr-FR')} minerais</div>
                  <div className="text-gold-light text-xs">{(e.total_minerais * prixMinerai).toLocaleString('fr-FR')} $</div>
                </div>
                <button onClick={() => startEdit(e)} className="text-white/30 hover:text-white p-1.5">
                  <Pencil size={14} />
                </button>
              </div>

              {editingId === e.id && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-white/8">
                  <input
                    value={editDiscord}
                    onChange={(ev) => setEditDiscord(ev.target.value)}
                    placeholder="Discord (pseudo#0001)"
                    className="flex-1 rounded-lg bg-white/5 border border-white/12 px-3 py-2 text-sm text-white outline-none focus:border-gold/50"
                  />
                  <select
                    value={editRole}
                    onChange={(ev) => setEditRole(ev.target.value as 'admin' | 'employe')}
                    className="rounded-lg bg-white/5 border border-white/12 px-3 py-2 text-sm text-white outline-none focus:border-gold/50"
                  >
                    <option value="employe">Employé</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" variant="gold" onClick={() => saveEdit(e.id)}><Check size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X size={14} /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-white/30 text-center py-6">Aucun employé trouvé.</p>}
        </div>
      </Card>
    </div>
  )
}
