/** Cover gradients for books without an image, keyed by the genre value stored in the database. */
const GENRE_GRADIENTS: Record<string, string> = {
  'Роман': 'from-rose-400 to-pink-600',
  'Детектив': 'from-slate-500 to-gray-700',
  'Фантастика': 'from-blue-400 to-indigo-600',
  'Фэнтези': 'from-violet-400 to-purple-600',
  'Биография': 'from-amber-400 to-orange-500',
  'История': 'from-stone-400 to-stone-600',
  'Наука': 'from-cyan-400 to-teal-600',
  'Психология': 'from-emerald-400 to-green-600',
  'Бизнес': 'from-blue-500 to-cyan-600',
  'Поэзия': 'from-fuchsia-400 to-pink-500',
  'Классика': 'from-amber-500 to-yellow-600',
  'Приключения': 'from-orange-400 to-red-500',
  'Ужасы': 'from-gray-700 to-gray-900',
  'Юмор': 'from-yellow-400 to-orange-400',
}

const DEFAULT_GRADIENT = 'from-accent-400 to-accent-600'

export function genreGradient(genre: string) {
  return GENRE_GRADIENTS[genre] ?? DEFAULT_GRADIENT
}
