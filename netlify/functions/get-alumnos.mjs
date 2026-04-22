import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const store = getStore("alumnos");

  try {
    const data = await store.get("ranking", { type: "json" });

    if (!data) {
      // Alumnos iniciales con 0 puntos
      const alumnosIniciales = [
        { id: 1, nombre: "Ariana Baez", puntos: 0, avatar: "🦁" },
        { id: 2, nombre: "Marcos Dávila", puntos: 0, avatar: "🐯" },
        { id: 3, nombre: "Alejandro Gago", puntos: 0, avatar: "🦊" },
        { id: 4, nombre: "Nora González", puntos: 0, avatar: "🐺" },
        { id: 5, nombre: "Illán Iglesias", puntos: 0, avatar: "🦅" },
        { id: 6, nombre: "Prestone Kabu", puntos: 0, avatar: "🐉" },
        { id: 7, nombre: "Álex Lozano", puntos: 0, avatar: "🦋" },
        { id: 8, nombre: "Daniela Marcos", puntos: 0, avatar: "🐬" },
        { id: 9, nombre: "Irene Marín", puntos: 0, avatar: "🦄" },
        { id: 10, nombre: "Amy Medina", puntos: 0, avatar: "🐲" },
        { id: 11, nombre: "Alejandro Osal", puntos: 0, avatar: "🦈" },
        { id: 12, nombre: "Alejandro Parrondo", puntos: 0, avatar: "🐻" },
        { id: 13, nombre: "Adrián Salinas", puntos: 0, avatar: "🦝" },
        { id: 14, nombre: "Adriana Severiche", puntos: 0, avatar: "🐙" },
        { id: 15, nombre: "Marina Villalba", puntos: 0, avatar: "🦖" },
      ];
      await store.setJSON("ranking", alumnosIniciales);
      return new Response(JSON.stringify(alumnosIniciales), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export const config = {
  path: "/api/alumnos",
};
