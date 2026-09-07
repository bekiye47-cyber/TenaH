import { Book, Challenge, Video, WalletTransaction } from '../types';

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'chal-1',
    title: 'Morning Sun Salutation & Prana Flow',
    description: 'Begin your day with 10 minutes of gentle spinal awakening and deep intentional solar breathing.',
    category: 'movement',
    duration_minutes: 10,
    is_paid: false,
    price: 0,
    reward_points: 15,
  },
  {
    id: 'chal-2',
    title: 'Conscious Diaphragmatic Breathwork',
    description: 'Practice the 4-7-8 parasympathetic reset technique to quiet cortisol and restore mental clarity.',
    category: 'breathwork',
    duration_minutes: 8,
    is_paid: false,
    price: 0,
    reward_points: 20,
  },
  {
    id: 'chal-3',
    title: 'Cellular Hydration & Herbal Elixir',
    description: 'Prepare and savor 500ml of mineralized lukewarm lemon water infused with fresh rosemary and sea salt.',
    category: 'nutrition',
    duration_minutes: 5,
    is_paid: false,
    price: 0,
    reward_points: 10,
  },
  {
    id: 'chal-4',
    title: 'Advanced Somatic Nervous System Reset',
    description: 'Guided masterclass on vagal nerve toning, craniosacral release, and tension discharge.',
    category: 'mindfulness',
    duration_minutes: 25,
    is_paid: true,
    price: 3.50,
    reward_points: 50,
  },
  {
    id: 'chal-5',
    title: 'Ayurvedic Circadian Sleep Protocol',
    description: 'Master the 90-minute digital sundown ritual, abhyanga foot oiling, and deep sleep wave entrainment.',
    category: 'sleep',
    duration_minutes: 20,
    is_paid: true,
    price: 4.00,
    reward_points: 60,
  },
  {
    id: 'chal-6',
    title: 'Mindful Woodland Earthing / Forest Bathing',
    description: 'Spend 15 minutes bare-soled on natural ground or practicing sensory grounding with trees and soil.',
    category: 'mindfulness',
    duration_minutes: 15,
    is_paid: false,
    price: 0,
    reward_points: 25,
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'The Art of Herbal Alchemy',
    author: 'Dr. Selamawit Tena',
    cover_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    description: 'An ancient-modern apothecary guide to adaptogenic roots, botanical infusions, and bio-regional plant remedies.',
    category: 'Herbal Medicine',
    pages: 148,
    read_time_minutes: 45,
    is_paid: false,
    price: 0,
    excerpt: `Chapter 1: The Principle of Herbal Vitalism

In the ancient tradition of holistic healing, plants are not merely mechanical compounds of active alkaloids; they are intricate bio-chemical resonance structures evolved over millennia in symbiosis with our planet.

When we consume an adaptogen such as Ashwagandha, Holy Basil (Tulsi), or Moringa, we are introducing organic compounds that assist our neuro-endocrine network in modulating homeostatic balance.

Essential Daily Infusions:
1. Morning Awakening: Nettle leaf + Fresh ginger root + raw mountain honey.
2. Midday Equilibrium: Tulsi + Lemon verbena + touch of hibiscus.
3. Evening Restoration: Chamomile flower + Passionflower + Reishi powder.

Breathe deeply as your elixir steeps. The steam alone carries volatile essential terpenes into your olfactory cortex, lowering acute arterial tension before the first sip.`
  },
  {
    id: 'book-2',
    title: 'Breath as Medicine: Prana & Vagus',
    author: 'Kaleb Yohannes',
    cover_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    description: 'A clinical and spiritual treatise on pulmonary volume, autonomic balance, and cellular oxygenation.',
    category: 'Breathwork',
    pages: 192,
    read_time_minutes: 60,
    is_paid: true,
    price: 5.99,
    excerpt: `Chapter 3: The 5.5 Second Coherence Rhythm

Optimal human ventilation occurs not at 14 to 20 shallow breaths per minute (the tragic modern average), but at approximately 5.5 breaths per minute. At this precise frequency, heart rate variability (HRV) syncs with baroreflex resonance.

To practice:
- Inhale quietly through the nose for 5.5 seconds, expanding the 360-degree lower ribs.
- Exhale gently through relaxed lips for 5.5 seconds, allowing the diaphragm to ascend naturally.
- Repeat for 20 cycles twice daily.`
  },
  {
    id: 'book-3',
    title: 'Sacred Rest: Circadian Living',
    author: 'Elena Vance',
    cover_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format&fit=crop&q=80',
    description: 'Realigning human biology with solar pulses, infrared dawn light, and deep restorative delta slumber.',
    category: 'Sleep & Rhythms',
    pages: 164,
    read_time_minutes: 50,
    is_paid: true,
    price: 4.50,
    excerpt: `Introduction: Light as the Ultimate Gene Regulator

Every organ in the mammalian body hosts peripheral circadian clock oscillators. The master pacemaker, the suprachiasmatic nucleus (SCN), requires direct photonic cues within 30 minutes of sunrise to set your nighttime melatonin countdown.`
  },
  {
    id: 'book-4',
    title: 'Mindful Nourishment Handbook',
    author: 'Tena Culinary Lab',
    cover_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
    description: 'Simple plant-based seasonal recipes, gut-biome microbiome fermentations, and mindful mastication rituals.',
    category: 'Holistic Nutrition',
    pages: 110,
    read_time_minutes: 35,
    is_paid: false,
    price: 0,
    excerpt: `The Three Rules of Digestive Mindfulness:
1. Never ingest food in a sympathetic state (rushed, driving, or stressed).
2. Chew each morsel until it reaches liquid consistency.
3. Leave 30% of stomach volume empty to allow digestive fire (Agni) room to churn.`
  },
  {
    id: 'book-5',
    title: 'Somatic Healing & Body Wisdom',
    author: 'Dr. Selamawit Tena',
    cover_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&auto=format&fit=crop&q=80',
    description: 'Decoupling physical trauma stored in fascial membranes through unwinding and mindful embodiment.',
    category: 'Somatic Healing',
    pages: 220,
    read_time_minutes: 75,
    is_paid: true,
    price: 7.99,
    excerpt: `Chapter 2: The Fascial Memory Web

The fascia is a continuous crystalline semiconductor network transferring piezoelectric signals faster than neural axons. When emotion is suppressed, the matrix dehydrates and contracts.`
  },
  {
    id: 'book-6',
    title: 'Daily Stillness: A 30-Day Primer',
    author: 'Marcus Holst',
    cover_url: 'https://images.unsplash.com/photo-1508672019048-805b876b67e2?w=600&auto=format&fit=crop&q=80',
    description: 'Accessible daily reflections and non-judgmental awareness prompts for high-performance minds.',
    category: 'Mindfulness',
    pages: 96,
    read_time_minutes: 30,
    is_paid: false,
    price: 0,
    excerpt: `Day 1: The Observer Above the Clouds

You are not the storm. You are the infinite azure sky through which the meteorological phenomenon of thought temporarily passes.`
  }
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: '15-Minute Morning Vagus Nerve Stimulation & Calm',
    youtube_url: 'https://www.youtube.com/watch?v=rbmE6d8-npo',
    youtube_id: 'rbmE6d8-npo',
    thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    category: 'Breathwork',
    duration: '15:20',
    instructor: 'Master Kaleb',
    views: '124K'
  },
  {
    id: 'vid-2',
    title: 'Tibetan Singing Bowls: Deep Delta Wave Sound Bath',
    youtube_url: 'https://www.youtube.com/watch?v=1ZYbU88VzII',
    youtube_id: '1ZYbU88VzII',
    thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format&fit=crop&q=80',
    category: 'Sound Healing',
    duration: '45:00',
    instructor: 'Tena Sound Lab',
    views: '89K'
  },
  {
    id: 'vid-3',
    title: 'Gentle Spinal Mobility & Restorative Yoga',
    youtube_url: 'https://www.youtube.com/watch?v=b1H3xO3x_Js',
    youtube_id: 'b1H3xO3x_Js',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    category: 'Yoga & Movement',
    duration: '20:15',
    instructor: 'Sarah Jenkins',
    views: '210K'
  },
  {
    id: 'vid-4',
    title: 'Guided Body Scan for Instant Tension Relief',
    youtube_url: 'https://www.youtube.com/watch?v=u4gZgnCy5ew',
    youtube_id: 'u4gZgnCy5ew',
    thumbnail_url: 'https://images.unsplash.com/photo-1508672019048-805b876b67e2?w=600&auto=format&fit=crop&q=80',
    category: 'Meditation',
    duration: '12:40',
    instructor: 'Dr. Selamawit Tena',
    views: '56K'
  },
  {
    id: 'vid-5',
    title: 'Herbal Infusion Masterclass: Adaptogens & Roots',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_id: 'dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
    category: 'Holistic Nutrition',
    duration: '18:30',
    instructor: 'Amina Nour',
    views: '43K'
  },
  {
    id: 'vid-6',
    title: '4-7-8 Breathwork Practice for Deep Sleep',
    youtube_url: 'https://www.youtube.com/watch?v=1ZYbU88VzII',
    youtube_id: '1ZYbU88VzII',
    thumbnail_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&auto=format&fit=crop&q=80',
    category: 'Breathwork',
    duration: '10:05',
    instructor: 'Kaleb Yohannes',
    views: '315K'
  },
  {
    id: 'vid-7',
    title: 'Yin Yoga for Hip Opening & Emotional Release',
    youtube_url: 'https://www.youtube.com/watch?v=b1H3xO3x_Js',
    youtube_id: 'b1H3xO3x_Js',
    thumbnail_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    category: 'Yoga & Movement',
    duration: '35:00',
    instructor: 'Sarah Jenkins',
    views: '178K'
  },
  {
    id: 'vid-8',
    title: '432Hz Binaural Beats Meditation for Mind Silence',
    youtube_url: 'https://www.youtube.com/watch?v=rbmE6d8-npo',
    youtube_id: 'rbmE6d8-npo',
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    category: 'Sound Healing',
    duration: '60:00',
    instructor: 'Tena Sound Lab',
    views: '540K'
  },
  {
    id: 'vid-9',
    title: 'Ayurvedic Spices for Microbiome Diversity',
    youtube_url: 'https://www.youtube.com/watch?v=u4gZgnCy5ew',
    youtube_id: 'u4gZgnCy5ew',
    thumbnail_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    category: 'Holistic Nutrition',
    duration: '14:15',
    instructor: 'Dr. Selamawit Tena',
    views: '92K'
  },
  {
    id: 'vid-10',
    title: 'Box Breathing (4x4) Focus Ritual for Peak Clarity',
    youtube_url: 'https://www.youtube.com/watch?v=rbmE6d8-npo',
    youtube_id: 'rbmE6d8-npo',
    thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    category: 'Breathwork',
    duration: '08:45',
    instructor: 'Master Kaleb',
    views: '67K'
  },
  {
    id: 'vid-11',
    title: 'Evening Candlelight Guided Meditation',
    youtube_url: 'https://www.youtube.com/watch?v=u4gZgnCy5ew',
    youtube_id: 'u4gZgnCy5ew',
    thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format&fit=crop&q=80',
    category: 'Meditation',
    duration: '22:10',
    instructor: 'Elena Vance',
    views: '112K'
  },
  {
    id: 'vid-12',
    title: 'Chakra Tuning with Crystal Singing Bowls',
    youtube_url: 'https://www.youtube.com/watch?v=1ZYbU88VzII',
    youtube_id: '1ZYbU88VzII',
    thumbnail_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&auto=format&fit=crop&q=80',
    category: 'Sound Healing',
    duration: '30:00',
    instructor: 'Tena Sound Lab',
    views: '204K'
  },
  {
    id: 'vid-13',
    title: 'Somatic Tremoring & Nervous System Release',
    youtube_url: 'https://www.youtube.com/watch?v=rbmE6d8-npo',
    youtube_id: 'rbmE6d8-npo',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    category: 'Somatic Healing',
    duration: '16:40',
    instructor: 'Dr. Selamawit Tena',
    views: '135K'
  },
  {
    id: 'vid-14',
    title: 'Morning Sunlight & Circadian Mitochondrial Reset',
    youtube_url: 'https://www.youtube.com/watch?v=u4gZgnCy5ew',
    youtube_id: 'u4gZgnCy5ew',
    thumbnail_url: 'https://images.unsplash.com/photo-1508672019048-805b876b67e2?w=600&auto=format&fit=crop&q=80',
    category: 'Circadian Health',
    duration: '11:50',
    instructor: 'Elena Vance',
    views: '98K'
  },
  {
    id: 'vid-15',
    title: 'Ancient Ethiopian Herbal Steam (Woqet) for Vitality',
    youtube_url: 'https://www.youtube.com/watch?v=1ZYbU88VzII',
    youtube_id: '1ZYbU88VzII',
    thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format&fit=crop&q=80',
    category: 'Herbal Medicine',
    duration: '25:00',
    instructor: 'Amina Nour',
    views: '162K'
  }
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    user_telegram_id: 72819402,
    type: 'deposit',
    amount: 25.00,
    status: 'approved',
    description: 'Initial Welcome Wellness Top-up',
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString()
  },
  {
    id: 'tx-2',
    user_telegram_id: 72819402,
    type: 'reward',
    amount: 5.00,
    status: 'approved',
    description: '3-Day Challenge Streak Bonus',
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  },
  {
    id: 'tx-3',
    user_telegram_id: 72819402,
    type: 'deposit',
    amount: 15.00,
    status: 'pending',
    proof_filename: 'bank_transfer_slip_tena.png',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    description: 'Bank slip transfer verification pending',
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
  }
];
