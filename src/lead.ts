export const experiences = { beginner: 'С нуля', basic: 'Есть базовый опыт', performing: 'Уже выступаю' } as const;
export type Lead = { name: string; telegram: string; experience: keyof typeof experiences; comment: string; adult: boolean; consent: boolean; website: string };
export function normalizeTelegram(value: string): string | null {
  const name = value.trim().replace(/^https?:\/\/(?:www\.)?t\.me\//i, '').replace(/^t\.me\//i, '').replace(/^@/, '').replace(/\/$/, '');
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(name) ? `@${name}` : null;
}
export function validateLead(input: unknown): { lead: Lead } | { error: string; field?: string } {
  if (!input || typeof input !== 'object') return { error: 'Проверь данные заявки.' };
  const d = input as Record<string, unknown>;
  if (typeof d.name !== 'string' || !d.name.trim() || d.name.trim().length > 80) return {error:'Укажи имя — от 1 до 80 символов.',field:'name'};
  const telegram = typeof d.telegram === 'string' && d.telegram.length <= 100 ? normalizeTelegram(d.telegram) : null;
  if (!telegram) return {error:'Укажи публичный Telegram: @username или t.me/username (5–32 символа).',field:'telegram'};
  if (typeof d.experience !== 'string' || !Object.hasOwn(experiences,d.experience)) return {error:'Выбери свой опыт.',field:'experience'};
  if (typeof d.comment !== 'string' || d.comment.length > 1000) return {error:'Комментарий должен быть не длиннее 1000 символов.',field:'comment'};
  if (d.adult !== true) return {error:'Обучение доступно только с 18 лет. Подтверди возраст.',field:'adult'};
  if (d.consent !== true) return {error:'Для отправки необходимо согласие на обработку данных.',field:'consent'};
  if (typeof d.website !== 'string' || d.website) return {error:'Не удалось отправить заявку.'};
  return {lead:{name:d.name.trim(),telegram,experience:d.experience as Lead['experience'],comment:d.comment.trim(),adult:true,consent:true,website:''}};
}
