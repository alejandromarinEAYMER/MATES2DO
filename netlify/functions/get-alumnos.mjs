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
        { id: 1, nombre: "Alumno 1", puntos: 0, avatar: "🦁" },
        { id: 2, nombre: "Alumno 2", puntos: 0, avatar: "🐯" },
        { id: 3, nombre: "Alumno 3", puntos: 0, avatar: "🦊" },
        { id: 4, nombre: "Alumno 4", puntos: 0, avatar: "🐺" },
        { id: 5, nombre: "Alumno 5", puntos: 0, avatar: "🦅" },
        { id: 6, nombre: "Alumno 6", puntos: 0, avatar: "🐉" },
        { id: 7, nombre: "Alumno 7", puntos: 0, avatar: "🦋" },
        { id: 8, nombre: "Alumno 8", puntos: 0, avatar: "🐬" },
        { id: 9, nombre: "Alumno 9", puntos: 0, avatar: "🦄" },
        { id: 10, nombre: "Alumno 10", puntos: 0, avatar: "🐲" },
        { id: 11, nombre: "Alumno 11", puntos: 0, avatar: "🦈" },
        { id: 12, nombre: "Alumno 12", puntos: 0, avatar: "🐻" },
        { id: 13, nombre: "Alumno 13", puntos: 0, avatar: "🦝" },
        { id: 14, nombre: "Alumno 14", puntos: 0, avatar: "🐙" },
        { id: 15, nombre: "Alumno 15", puntos: 0, avatar: "🦖" },
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
