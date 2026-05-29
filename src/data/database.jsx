// Ruta: src/data/database.jsx
import React from 'react';
import { BookMarked, TrendingUp, Sparkles } from 'lucide-react';

export const booksDatabase = [
  {
    id: 1,
    level: "Básico",
    icon: <BookMarked className="w-5 h-5 text-blue-500" />,
    title: "The Cat and The Dog",
    cover: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Palabras básicas y repetitivas para memorizar rápido.",
    content: "The cat is small. The cat is black. The dog is big. The dog is brown. The cat runs. The dog runs. The cat sleeps. The dog sleeps. The cat and the dog are friends. The cat likes milk. The dog likes meat. The small cat is happy. The big dog is happy."
  },
  {
    id: 2,
    level: "Intermedio",
    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
    title: "A Day in the City",
    cover: "bg-green-100 text-green-700 border-green-200",
    description: "Vocabulario de rutinas, lugares y clima.",
    content: "Yesterday morning, Sarah decided to explore the bustling city center. She walked through the crowded streets, looking at the tall buildings and bright shop windows. She bought a hot coffee at the corner bakery and sat on a wooden bench in the park. The weather was pleasantly warm, and people were everywhere."
  },
  {
    id: 3,
    level: "Avanzado",
    icon: <Sparkles className="w-5 h-5 text-orange-500" />,
    title: "The Ancient Clock",
    cover: "bg-orange-100 text-orange-700 border-orange-200",
    description: "Estructuras gramaticales complejas y vocabulario rico.",
    content: "Hidden within the dusty confines of the abandoned attic lay an intricate, antique clock. Its elaborate brass gears, tarnished by decades of neglect, whispered tales of a bygone era. An eccentric horologist once claimed that this peculiar timepiece possessed the uncanny ability to manipulate the very fabric of chronological progression, though such assertions were widely dismissed as sheer lunacy."
  },
  {
    id: 4,
    level: "Avanzado",
    icon: <BookMarked className="w-5 h-5 text-indigo-500" />,
    title: "1 Nephi 1 (Book of Mormon)",
    cover: "bg-indigo-100 text-indigo-700 border-indigo-200",
    description: "Texto clásico y extenso. Ideal para aprender vocabulario antiguo y formal.",
    content: "I, Nephi, having been born of goodly parents, therefore I was taught somewhat in all the learning of my father; and having seen many afflictions in the course of my days, nevertheless, having been highly favored of the Lord in all my days; yea, having had a great knowledge of the goodness and the mysteries of God, therefore I make a record of my proceedings in my days. Yea, I make a record in the language of my father, which consists of the learning of the Jews and the language of the Egyptians. And I know that the record which I make is true; and I make it with mine own hand; and I make it according to my knowledge."
  }
];

export const mockDictionary = (word) => {
  const cleanWord = word.toLowerCase().trim();
  const db = {
    'the': { translation: 'el / la / los / las', explanation: 'Artículo definido usado para referirse a algo específico.', emoji: '👉', example: 'The book is on the table.' },
    'cat': { translation: 'gato', explanation: 'Animal felino doméstico.', emoji: '🐱', example: 'The cat sleeps all day.' },
    'dog': { translation: 'perro', explanation: 'Animal canino doméstico, el mejor amigo del hombre.', emoji: '🐶', example: 'The dog loves to play fetch.' },
    'is': { translation: 'es / está', explanation: 'Tercera persona del verbo "to be" (ser o estar).', emoji: '📍', example: 'She is very smart.' },
    'small': { translation: 'pequeño', explanation: 'De tamaño reducido.', emoji: '🐁', example: 'I have a small house.' },
    'big': { translation: 'grande', explanation: 'De tamaño amplio o mayor a lo normal.', emoji: '🐘', example: 'That is a big car.' },
    'black': { translation: 'negro', explanation: 'Color oscuro, ausencia de luz.', emoji: '⬛', example: 'He wears a black shirt.' },
    'brown': { translation: 'marrón / café', explanation: 'Color de la tierra o la madera.', emoji: '🟫', example: 'The bear is brown.' },
    'runs': { translation: 'corre', explanation: 'Acción de moverse rápidamente sobre las piernas.', emoji: '🏃', example: 'He runs every morning.' },
    'sleeps': { translation: 'duerme', explanation: 'Acción de descansar en estado de inconsciencia.', emoji: '😴', example: 'The baby sleeps peacefully.' },
    'friends': { translation: 'amigos', explanation: 'Personas o animales que se tienen afecto.', emoji: '🤝', example: 'They are best friends.' },
    'likes': { translation: 'gusta', explanation: 'Sentir agrado por algo.', emoji: '❤️', example: 'She likes chocolate.' },
    'happy': { translation: 'feliz', explanation: 'Sentir alegría o satisfacción.', emoji: '😄', example: 'I am so happy today.' },
    'yesterday': { translation: 'ayer', explanation: 'El día anterior a hoy.', emoji: '📅', example: 'Yesterday was a great day.' },
    'morning': { translation: 'mañana', explanation: 'La primera parte del día.', emoji: '🌅', example: 'Good morning everyone!' },
    'explore': { translation: 'explorar', explanation: 'Viajar por un lugar para conocerlo.', emoji: '🗺️', example: 'Let us explore the forest.' },
    'bustling': { translation: 'animado / bullicioso', explanation: 'Lleno de actividad ruidosa y enérgica.', emoji: '🏙️', example: 'New York is a bustling city.' },
    'crowded': { translation: 'concurrido / lleno', explanation: 'Lleno de mucha gente.', emoji: '🧑‍🤝‍🧑', example: 'The train was very crowded.' },
    'buildings': { translation: 'edificios', explanation: 'Estructuras construidas con paredes y techo.', emoji: '🏢', example: 'Look at those tall buildings.' },
    'bought': { translation: 'compró', explanation: 'Pasado del verbo "buy" (comprar).', emoji: '🛍️', example: 'I bought a new phone.' },
    'wooden': { translation: 'de madera', explanation: 'Hecho del material de los árboles.', emoji: '🪵', example: 'He sat on a wooden chair.' },
    'pleasantly': { translation: 'agradablemente', explanation: 'De una manera que da placer.', emoji: '😌', example: 'The weather was pleasantly warm.' },
    'hidden': { translation: 'escondido / oculto', explanation: 'Puesto fuera de la vista.', emoji: '🙈', example: 'The treasure is hidden.' },
    'dusty': { translation: 'polvoriento', explanation: 'Cubierto de polvo o suciedad fina.', emoji: '💨', example: 'The old books are dusty.' },
    'confines': { translation: 'confines / límites', explanation: 'Los límites o bordes de algo.', emoji: '🚧', example: 'Within the confines of the room.' },
    'intricate': { translation: 'intrincado / complejo', explanation: 'Muy complicado o detallado.', emoji: '🧩', example: 'The puzzle has an intricate design.' },
    'tarnished': { translation: 'deslustrado / manchado', explanation: 'Que ha perdido su brillo (generalmente metal).', emoji: '🥉', example: 'The old silver spoon is tarnished.' },
    'eccentric': { translation: 'excéntrico', explanation: 'Persona de comportamiento extraño o poco convencional.', emoji: '🤪', example: 'My uncle is quite eccentric.' },
    'horologist': { translation: 'relojero', explanation: 'Persona que hace o repara relojes.', emoji: '🕰️', example: 'The horologist fixed my grandfather clock.' },
    'uncanny': { translation: 'misterioso / asombroso', explanation: 'Extraño o misterioso de una manera inquietante.', emoji: '👽', example: 'He has an uncanny resemblance to his father.' },
    'lunacy': { translation: 'locura', explanation: 'Estado de estar loco o cometer acciones insensatas.', emoji: '🤯', example: 'Driving in that storm is sheer lunacy.' },
    'i': { translation: 'yo', explanation: 'Pronombre personal de primera persona.', emoji: '🙋', example: 'I am reading a book.' },
    'nephi': { translation: 'Nefi', explanation: 'Nombre propio. Profeta y escritor del primer libro.', emoji: '✍️', example: 'I, Nephi, wrote this record.' },
    'having': { translation: 'habiendo / teniendo', explanation: 'Gerundio de tener o haber.', emoji: '🤲', example: 'Having seen many things.' },
    'been': { translation: 'sido / estado', explanation: 'Participio del verbo ser o estar.', emoji: '⏳', example: 'I have been there.' },
    'born': { translation: 'nacido', explanation: 'Llegar al mundo.', emoji: '👶', example: 'He was born in 1990.' },
    'of': { translation: 'de', explanation: 'Preposición que indica origen o posesión.', emoji: '🔗', example: 'The book of rules.' },
    'goodly': { translation: 'buenos / virtuosos', explanation: 'Término antiguo para buena calidad o rectitud.', emoji: '✨', example: 'He comes from a goodly family.' },
    'parents': { translation: 'padres', explanation: 'Madre y padre.', emoji: '👪', example: 'My parents are kind.' },
    'therefore': { translation: 'por lo tanto', explanation: 'Conjunción que indica consecuencia.', emoji: '➡️', example: 'I think, therefore I am.' },
    'was': { translation: 'fui / era / estaba', explanation: 'Pasado del verbo to be para singulares.', emoji: '🕰️', example: 'I was happy.' },
    'taught': { translation: 'enseñado', explanation: 'Pasado y participio de enseñar (teach).', emoji: '👨‍🏫', example: 'She taught me English.' },
    'somewhat': { translation: 'un poco / algo', explanation: 'En cierta medida.', emoji: '🤏', example: 'I am somewhat tired.' },
    'in': { translation: 'en', explanation: 'Preposición de lugar o estado.', emoji: '📦', example: 'The cat is in the box.' },
    'all': { translation: 'todo', explanation: 'La totalidad de algo.', emoji: '💯', example: 'All the people agreed.' },
    'learning': { translation: 'aprendizaje / conocimiento', explanation: 'Acción de adquirir conocimiento.', emoji: '🧠', example: 'Learning is fun.' },
    'my': { translation: 'mi / mis', explanation: 'Adjetivo posesivo.', emoji: '✋', example: 'This is my house.' },
    'father': { translation: 'padre', explanation: 'Progenitor masculino.', emoji: '👨', example: 'His father is tall.' },
    'and': { translation: 'y', explanation: 'Conjunción copulativa.', emoji: '➕', example: 'You and I.' },
    'seen': { translation: 'visto', explanation: 'Participio de ver (see).', emoji: '👁️', example: 'I have seen it.' },
    'many': { translation: 'muchos', explanation: 'Gran cantidad.', emoji: '🔢', example: 'There are many cars.' },
    'afflictions': { translation: 'aflicciones', explanation: 'Sufrimientos, penas o dificultades.', emoji: '😥', example: 'He endured many afflictions.' },
    'course': { translation: 'curso / transcurso', explanation: 'Desarrollo en el tiempo.', emoji: '⏳', example: 'In the course of a week.' },
    'days': { translation: 'días', explanation: 'Plural de día.', emoji: '📆', example: 'Seven days a week.' },
    'nevertheless': { translation: 'sin embargo', explanation: 'Conjunción adversativa, a pesar de eso.', emoji: '⚖️', example: 'It rained; nevertheless, we played.' },
    'highly': { translation: 'altamente / muy', explanation: 'En gran grado.', emoji: '📈', example: 'Highly recommended.' },
    'favored': { translation: 'favorecido', explanation: 'Que recibe un favor o gracia.', emoji: '🎁', example: 'He was favored by the king.' },
    'lord': { translation: 'señor', explanation: 'Título de respeto o deidad.', emoji: '👑', example: 'The Lord is my shepherd.' },
    'yea': { translation: 'sí / ciertamente', explanation: 'Afirmación antigua equivalente a "yes".', emoji: '✅', example: 'Yea, it is true.' },
    'had': { translation: 'tenido / había', explanation: 'Pasado de tener (have).', emoji: '🤲', example: 'I had a dog.' },
    'a': { translation: 'un / una', explanation: 'Artículo indefinido.', emoji: '1️⃣', example: 'A cat.' },
    'great': { translation: 'gran / grande', explanation: 'De tamaño o importancia considerable.', emoji: '🏔️', example: 'A great leader.' },
    'knowledge': { translation: 'conocimiento', explanation: 'Entendimiento o información adquirida.', emoji: '💡', example: 'Knowledge is power.' },
    'goodness': { translation: 'bondad', explanation: 'Cualidad de ser bueno.', emoji: '💖', example: 'Thank goodness!' },
    'mysteries': { translation: 'misterios', explanation: 'Cosas secretas o difíciles de entender.', emoji: '🔮', example: 'The mysteries of the universe.' },
    'god': { translation: 'dios', explanation: 'Deidad suprema.', emoji: '🌤️', example: 'God bless you.' },
    'make': { translation: 'hago / hacer', explanation: 'Crear, fabricar o preparar algo.', emoji: '🛠️', example: 'Make a cake.' },
    'record': { translation: 'registro / historia', explanation: 'Documento que guarda información.', emoji: '📜', example: 'I kept a record.' },
    'proceedings': { translation: 'hechos / obras', explanation: 'Acciones, eventos o procedimientos.', emoji: '📝', example: 'Record of proceedings.' },
    'language': { translation: 'lenguaje / idioma', explanation: 'Sistema de comunicación.', emoji: '🗣️', example: 'The English language.' },
    'which': { translation: 'el cual / que / cual', explanation: 'Pronombre relativo o interrogativo.', emoji: '❓', example: 'Which one is yours?' },
    'consists': { translation: 'consiste', explanation: 'Estar compuesto de.', emoji: '🧱', example: 'Water consists of hydrogen and oxygen.' },
    'jews': { translation: 'judíos', explanation: 'Pueblo de Israel.', emoji: '🕍', example: 'The history of the Jews.' },
    'egyptians': { translation: 'egipcios', explanation: 'Habitantes del antiguo Egipto.', emoji: '🐪', example: 'The ancient Egyptians.' },
    'know': { translation: 'sé / conocer', explanation: 'Tener información o entendimiento.', emoji: '🧠', example: 'I know the answer.' },
    'that': { translation: 'que / eso', explanation: 'Conjunción o pronombre demostrativo.', emoji: '👉', example: 'I know that.' },
    'true': { translation: 'verdadero', explanation: 'Que es cierto o real.', emoji: '✔️', example: 'That is true.' },
    'it': { translation: 'lo / eso', explanation: 'Pronombre neutro.', emoji: '📦', example: 'It is a book.' },
    'with': { translation: 'con', explanation: 'Preposición de compañía o instrumento.', emoji: '🤝', example: 'Come with me.' },
    'mine': { translation: 'mío / mis', explanation: 'Pronombre posesivo antiguo.', emoji: '🤲', example: 'The book is mine.' },
    'own': { translation: 'propio', explanation: 'Que pertenece a uno mismo.', emoji: '🏠', example: 'My own house.' },
    'hand': { translation: 'mano', explanation: 'Parte del cuerpo humano.', emoji: '🖐️', example: 'Raise your hand.' },
    'according': { translation: 'de acuerdo (con)', explanation: 'En conformidad con.', emoji: '📏', example: 'According to the rules.' },
    'to': { translation: 'a / hacia / para', explanation: 'Preposición de dirección o propósito.', emoji: '➡️', example: 'Go to school.' }
  };

  if (db[cleanWord]) {
      return {
          ...db[cleanWord],
          synonyms: ['palabra_similar1', 'palabra_similar2'], 
          antonyms: ['palabra_opuesta'],
          extraExamples: [
              `This is another example using ${cleanWord}.`,
              `People often say ${cleanWord} in this context.`
          ]
      };
  }

  return {
    translation: `[Traducir: ${cleanWord}]`,
    explanation: `Traducción automática para la palabra en este contexto.`,
    emoji: '✨',
    example: `I want to learn what "${cleanWord}" means.`
  };
};
