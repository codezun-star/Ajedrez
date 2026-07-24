/**
 * Achievement names & descriptions in every locale.
 *
 * Kept separate from the main `translations` dictionary to keep both readable.
 * Look up with {@link achievementText}, which falls back to English.
 */

import { Locale } from './locales';

type AchText = { name: string; desc: string };
type AchMap = Record<string, AchText>;

const en: AchMap = {
  'first-blood': { name: 'First Blood', desc: 'Win your first game.' },
  'checkmate-artist': { name: 'Checkmate Artist', desc: 'Win by checkmate.' },
  'streak-3': { name: 'On Fire', desc: 'Get a 3-win streak.' },
  'streak-5': { name: 'Unstoppable', desc: 'Get a 5-win streak.' },
  'giant-slayer': { name: 'Giant Slayer', desc: 'Beat the Expert AI.' },
  'hard-won': { name: 'Hard Won', desc: 'Beat the Hard AI.' },
  veteran: { name: 'Veteran', desc: 'Play 10 games.' },
  centurion: { name: 'Centurion', desc: 'Play 50 games.' },
  'elo-1400': { name: 'Climbing', desc: 'Reach 1400 Elo.' },
  'elo-1800': { name: "Experts' Room", desc: 'Reach 1800 Elo.' },
  'quick-mate': { name: 'Lightning Mate', desc: 'Win in 20 moves or fewer.' },
  comeback: { name: 'Comeback', desc: 'Win as Black.' },
};

const es: AchMap = {
  'first-blood': { name: 'Primera Sangre', desc: 'Gana tu primera partida.' },
  'checkmate-artist': { name: 'Artista del Mate', desc: 'Gana por jaque mate.' },
  'streak-3': { name: 'En Racha', desc: 'Consigue 3 victorias seguidas.' },
  'streak-5': { name: 'Imparable', desc: 'Consigue 5 victorias seguidas.' },
  'giant-slayer': { name: 'Mata Gigantes', desc: 'Vence a la IA Experto.' },
  'hard-won': { name: 'A Pulso', desc: 'Vence a la IA Difícil.' },
  veteran: { name: 'Veterano', desc: 'Juega 10 partidas.' },
  centurion: { name: 'Centurión', desc: 'Juega 50 partidas.' },
  'elo-1400': { name: 'Escalando', desc: 'Alcanza 1400 de ELO.' },
  'elo-1800': { name: 'Sala de Expertos', desc: 'Alcanza 1800 de ELO.' },
  'quick-mate': { name: 'Mate Relámpago', desc: 'Gana en 20 jugadas o menos.' },
  comeback: { name: 'Remontada', desc: 'Gana con negras.' },
};

const pt: AchMap = {
  'first-blood': { name: 'Primeiro Sangue', desc: 'Vença sua primeira partida.' },
  'checkmate-artist': { name: 'Artista do Mate', desc: 'Vença por xeque-mate.' },
  'streak-3': { name: 'Embalado', desc: 'Consiga 3 vitórias seguidas.' },
  'streak-5': { name: 'Imparável', desc: 'Consiga 5 vitórias seguidas.' },
  'giant-slayer': { name: 'Mata-Gigantes', desc: 'Vença a IA Experiente.' },
  'hard-won': { name: 'No Suor', desc: 'Vença a IA Difícil.' },
  veteran: { name: 'Veterano', desc: 'Jogue 10 partidas.' },
  centurion: { name: 'Centurião', desc: 'Jogue 50 partidas.' },
  'elo-1400': { name: 'Subindo', desc: 'Alcance 1400 de Elo.' },
  'elo-1800': { name: 'Sala dos Experts', desc: 'Alcance 1800 de Elo.' },
  'quick-mate': { name: 'Mate Relâmpago', desc: 'Vença em 20 lances ou menos.' },
  comeback: { name: 'Virada', desc: 'Vença de pretas.' },
};

const fr: AchMap = {
  'first-blood': { name: 'Premier Sang', desc: 'Gagnez votre première partie.' },
  'checkmate-artist': { name: 'Artiste du Mat', desc: 'Gagnez par échec et mat.' },
  'streak-3': { name: 'En Feu', desc: 'Enchaînez 3 victoires.' },
  'streak-5': { name: 'Inarrêtable', desc: 'Enchaînez 5 victoires.' },
  'giant-slayer': { name: 'Tueur de Géants', desc: "Battez l'IA Expert." },
  'hard-won': { name: 'À la Sueur', desc: "Battez l'IA Difficile." },
  veteran: { name: 'Vétéran', desc: 'Jouez 10 parties.' },
  centurion: { name: 'Centurion', desc: 'Jouez 50 parties.' },
  'elo-1400': { name: 'En Ascension', desc: 'Atteignez 1400 Elo.' },
  'elo-1800': { name: 'Salle des Experts', desc: 'Atteignez 1800 Elo.' },
  'quick-mate': { name: 'Mat Éclair', desc: 'Gagnez en 20 coups ou moins.' },
  comeback: { name: 'Remontée', desc: 'Gagnez avec les Noirs.' },
};

const de: AchMap = {
  'first-blood': { name: 'Erstes Blut', desc: 'Gewinne dein erstes Spiel.' },
  'checkmate-artist': { name: 'Matt-Künstler', desc: 'Gewinne durch Schachmatt.' },
  'streak-3': { name: 'In Fahrt', desc: 'Erreiche 3 Siege in Folge.' },
  'streak-5': { name: 'Unaufhaltsam', desc: 'Erreiche 5 Siege in Folge.' },
  'giant-slayer': { name: 'Riesentöter', desc: 'Besiege die Experten-KI.' },
  'hard-won': { name: 'Hart Erkämpft', desc: 'Besiege die schwere KI.' },
  veteran: { name: 'Veteran', desc: 'Spiele 10 Partien.' },
  centurion: { name: 'Zenturio', desc: 'Spiele 50 Partien.' },
  'elo-1400': { name: 'Aufstieg', desc: 'Erreiche 1400 Elo.' },
  'elo-1800': { name: 'Expertenraum', desc: 'Erreiche 1800 Elo.' },
  'quick-mate': { name: 'Blitzmatt', desc: 'Gewinne in 20 Zügen oder weniger.' },
  comeback: { name: 'Aufholjagd', desc: 'Gewinne mit Schwarz.' },
};

const ru: AchMap = {
  'first-blood': { name: 'Первая кровь', desc: 'Выиграйте первую партию.' },
  'checkmate-artist': { name: 'Мастер мата', desc: 'Выиграйте матом.' },
  'streak-3': { name: 'В ударе', desc: 'Серия из 3 побед.' },
  'streak-5': { name: 'Неудержимый', desc: 'Серия из 5 побед.' },
  'giant-slayer': { name: 'Победитель гигантов', desc: 'Обыграйте ИИ на уровне Эксперт.' },
  'hard-won': { name: 'С боем', desc: 'Обыграйте ИИ на уровне Сложный.' },
  veteran: { name: 'Ветеран', desc: 'Сыграйте 10 партий.' },
  centurion: { name: 'Центурион', desc: 'Сыграйте 50 партий.' },
  'elo-1400': { name: 'Восхождение', desc: 'Достигните 1400 Эло.' },
  'elo-1800': { name: 'Зал экспертов', desc: 'Достигните 1800 Эло.' },
  'quick-mate': { name: 'Молниеносный мат', desc: 'Выиграйте за 20 ходов или меньше.' },
  comeback: { name: 'Камбэк', desc: 'Выиграйте чёрными.' },
};

const hi: AchMap = {
  'first-blood': { name: 'पहली जीत', desc: 'अपनी पहली बाज़ी जीतें।' },
  'checkmate-artist': { name: 'मात का कलाकार', desc: 'शह-मात से जीतें।' },
  'streak-3': { name: 'लय में', desc: 'लगातार 3 जीत हासिल करें।' },
  'streak-5': { name: 'अजेय', desc: 'लगातार 5 जीत हासिल करें।' },
  'giant-slayer': { name: 'दानव-वध', desc: 'विशेषज्ञ एआई को हराएँ।' },
  'hard-won': { name: 'मेहनत से', desc: 'कठिन एआई को हराएँ।' },
  veteran: { name: 'अनुभवी', desc: '10 बाज़ियाँ खेलें।' },
  centurion: { name: 'शतवीर', desc: '50 बाज़ियाँ खेलें।' },
  'elo-1400': { name: 'चढ़ाई', desc: '1400 एलो तक पहुँचें।' },
  'elo-1800': { name: 'विशेषज्ञ कक्ष', desc: '1800 एलो तक पहुँचें।' },
  'quick-mate': { name: 'बिजली मात', desc: '20 चालों या कम में जीतें।' },
  comeback: { name: 'वापसी', desc: 'काले मोहरों से जीतें।' },
};

const zh: AchMap = {
  'first-blood': { name: '首胜', desc: '赢得你的第一局。' },
  'checkmate-artist': { name: '将杀艺术家', desc: '以将杀获胜。' },
  'streak-3': { name: '状态火热', desc: '取得3连胜。' },
  'streak-5': { name: '势不可挡', desc: '取得5连胜。' },
  'giant-slayer': { name: '巨人杀手', desc: '击败专家级 AI。' },
  'hard-won': { name: '来之不易', desc: '击败困难级 AI。' },
  veteran: { name: '老兵', desc: '进行10局对弈。' },
  centurion: { name: '百夫长', desc: '进行50局对弈。' },
  'elo-1400': { name: '攀登', desc: '达到1400 Elo。' },
  'elo-1800': { name: '专家殿堂', desc: '达到1800 Elo。' },
  'quick-mate': { name: '闪电将杀', desc: '20步以内获胜。' },
  comeback: { name: '逆转', desc: '执黑获胜。' },
};

const ja: AchMap = {
  'first-blood': { name: '初勝利', desc: '初めての対局に勝つ。' },
  'checkmate-artist': { name: 'メイトの達人', desc: 'チェックメイトで勝つ。' },
  'streak-3': { name: '波に乗る', desc: '3連勝する。' },
  'streak-5': { name: '止まらない', desc: '5連勝する。' },
  'giant-slayer': { name: '巨人殺し', desc: 'エキスパートAIを倒す。' },
  'hard-won': { name: '苦労の末', desc: '難しいAIを倒す。' },
  veteran: { name: 'ベテラン', desc: '10局プレイする。' },
  centurion: { name: 'センチュリオン', desc: '50局プレイする。' },
  'elo-1400': { name: '上昇中', desc: 'Elo 1400に到達。' },
  'elo-1800': { name: 'エキスパートの間', desc: 'Elo 1800に到達。' },
  'quick-mate': { name: '電光メイト', desc: '20手以内で勝つ。' },
  comeback: { name: '逆転', desc: '黒番で勝つ。' },
};

const ar: AchMap = {
  'first-blood': { name: 'أول انتصار', desc: 'افُز بأول مباراة لك.' },
  'checkmate-artist': { name: 'فنان الكش مات', desc: 'افُز بالكش مات.' },
  'streak-3': { name: 'في تألق', desc: 'حقّق 3 انتصارات متتالية.' },
  'streak-5': { name: 'لا يُوقَف', desc: 'حقّق 5 انتصارات متتالية.' },
  'giant-slayer': { name: 'قاهر العمالقة', desc: 'اهزم الذكاء الخبير.' },
  'hard-won': { name: 'بشقّ الأنفس', desc: 'اهزم الذكاء الصعب.' },
  veteran: { name: 'محنّك', desc: 'العب 10 مباريات.' },
  centurion: { name: 'قائد المئة', desc: 'العب 50 مباراة.' },
  'elo-1400': { name: 'في صعود', desc: 'ابلغ 1400 إيلو.' },
  'elo-1800': { name: 'قاعة الخبراء', desc: 'ابلغ 1800 إيلو.' },
  'quick-mate': { name: 'كش مات خاطف', desc: 'افُز في 20 نقلة أو أقل.' },
  comeback: { name: 'عودة', desc: 'افُز بالأسود.' },
};

const ALL: Record<Locale, AchMap> = { en, es, pt, fr, de, ru, hi, zh, ja, ar };

export function achievementText(locale: Locale, id: string): AchText {
  return ALL[locale]?.[id] ?? en[id] ?? { name: id, desc: '' };
}
