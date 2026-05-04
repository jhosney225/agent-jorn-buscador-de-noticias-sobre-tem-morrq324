
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Sistema de conversación para búsqueda de noticias
const newsSearchSystem = `Eres un asistente especializado en búsqueda y análisis de noticias. 
Tu rol es ayudar a los usuarios a encontrar noticias relevantes sobre temas de su interés.

Cuando un usuario te diga un tema que le interesa:
1. Reconoce el tema y muestra entusiasmo
2. Proporciona noticias ficticias pero realistas (ya que no tienes acceso a internet en tiempo real)
3. Formatea las noticias de manera clara con título, fuente, fecha y resumen
4. Ofrece filtros adicionales (por fecha, región, tipo de noticia, etc.)
5. Permite al usuario refinar su búsqueda con seguimientos

Mantén un registro de los temas que interesan al usuario en la sesión actual.
Sé conversacional y útil, sugiriendo temas relacionados cuando sea apropiado.`;

// Interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para obtener entrada del usuario
function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Función principal de búsqueda de noticias
async function newsSearchChat() {
  const conversationHistory = [];

  console.log("\n=== BUSCADOR DE NOTICIAS ===");
  console.log(
    'Busca noticias sobre temas que te interesen. Escribe "salir" para terminar.\n'
  );

  // Mensaje inicial del asistente
  console.log(
    "Asistente: ¡Hola! Soy tu asistente de búsqueda de noticias. ¿Sobre qué tema te gustaría encontrar noticias hoy?\n"
  );

  while (true) {
    // Obtener entrada del usuario
    const userInput = await getUserInput("Tú: ");

    // Verificar si el usuario quiere salir
    if (userInput.toLowerCase() === "salir") {
      console.log("\nAsistente: ¡Gracias por usar el buscador de noticias!");
      rl.close();
      break;
    }

    // Si la entrada está vacía, continuar
    if (!userInput) {
      continue;
    }

    // Agregar mensaje del usuario al historial
    conversationHistory.push({
      role: "user",
      content: userInput,
    });

    try {
      // Llamar a Claude API
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: newsSearchSystem,
        messages: conversationHistory,
      });

      // Extraer respuesta
      const assistantMessage =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Agregar respuesta al historial
      conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      // Mostrar respuesta formateada
      console.log(`\nAsistente: ${assistantMessage}\n`);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      console.log("Por favor, intenta de nuevo.\n");
      // Eliminar el último mensaje del usuario si hubo error
      conversationHistory.pop();
    }
  }
}

// Función alternativa: búsqueda rápida de noticias
async function quickNewsSearch(topic) {
  console.log(`\n=== BÚSQUEDA RÁPIDA DE NOTICIAS: ${topic.toUpperCase()} ===\n`);

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: newsSearchSystem,
      messages: [
        {
          role: "user",
          content: `Busca noticias sobre: ${topic}. Proporciona al menos 3 noticias relevantes con título, fuente, fecha y resumen breve.`,
        },
      ],
    });

    const result =
      response.content[0].type === "text" ? response.content[0].text : "";
    console.log(result);
  } catch (error) {
    console.error("Error en la búsqueda:", error);
  }
}

// Función para mostrar ejemplos de búsquedas
async function showExamples() {
  console.log("\n=== EJEMPLOS DE BÚSQUEDAS DISPONIBLES ===\n");
  console.log("1. Inteligencia Artificial");
  console.log("2. Cambio Climático");
  console.log("3. Tecnología Sostenible");
  console.log("4. Salud y Medicina");
  console.log("5. Economía Digital");
  console.log("6. Búsqueda personalizada\n");

  const choice = await getUserInput(
    "Selecciona un número (1-6) o escribe 0 para chat interactivo: "
  );

  const topics = {
    "1": "Inteligencia Artificial",
    "2": "Cambio Climático",
    "3": "Tecnología Sostenible",
    "4": "Salud y Medicina",
    "5": "Economía Digital",
  };

  if (choice === "0") {
    await newsSearchChat();
  } else if (choice === "6") {
    const customTopic = await getUserInput