import supabase from '../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const {
    tag, platform, type, search,
    sort = 'newest',
    page = 1,
    limit = 20
  } = req.query

  // Base query — join tips count and tags
  let query = supabase
    .from('episodes')
    .select(`
      id, title, episode_date, platform,
      host_only, guest_name, status,
      tips(count),
      episode_tags(tags(name))
    `, { count: 'exact' })

  // Apply filters
  if (platform) query = query.eq('platform', platform)
  if (type === 'solo')  query = query.eq('host_only', true)
  if (type === 'guest') query = query.eq('host_only', false)
  if (search) query = query.ilike('title', `%${search}%`)

  // Sorting
  const ascending = sort === 'oldest'
  query = query.order('episode_date', { ascending })

  // Pagination
  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query

  if (error) return res.status(500).json({ error: error.message })

  // Shape the response — flatten the nested joins
  const items = (data || []).map(ep => ({
    id:           ep.id,
    title:        ep.title,
    episode_date: ep.episode_date,
    platform:     ep.platform,
    host_only:    ep.host_only,
    guest_name:   ep.guest_name,
    status:       ep.status,
    tip_count:    ep.tips?.[0]?.count ?? 0,
    tags:         ep.episode_tags?.map(et => et.tags?.name).filter(Boolean) ?? []
  }))

  // Filter by tag (done in memory since Supabase join filtering is complex)
  const filtered = tag
    ? items.filter(ep => ep.tags.includes(tag))
    : items

  return res.json({ total: count, page: Number(page), items: filtered })
}