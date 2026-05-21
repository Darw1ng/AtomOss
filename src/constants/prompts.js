export const WRITING_PROMPTS = [
    'Qué te sorprendió hoy?',
    'Una idea que no quieres olvidar',
    'Algo que aprendiste esta semana',
    'Qué te quita el sueño?',
    'Una conversación memorable',
    'Tres cosas por las que estás agradecido',
    'Un problema que vale la pena resolver',
    'Si tuvieras una hora libre, qué harías?',
    'Qué patrón observas en tus últimos días?',
    'Qué quieres dejar atrás?',
    'Una decisión pendiente',
    'Algo que te emocionó',
    'Una pregunta sin respuesta',
    'Qué te haría sonreír mañana?',
    'Un recuerdo de hace un año',
    'Qué te motiva ahora?',
    'Una habilidad que quieres mejorar',
    'Algo que te haría falta valor para hacer',
    'Un libro, idea o persona que cambió tu mes',
    'Qué historia te contarías sobre hoy?',
];

export function getDailyPrompt() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = Date.now() - start.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    return WRITING_PROMPTS[dayOfYear % WRITING_PROMPTS.length];
}
