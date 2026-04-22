import { getStore } from "@netlify/blobs";

export default async (req, context) => {
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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const body = await req.json();
    const { id, puntos, nombre, avatar } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: "ID requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const store = getStore({name:"alumnos", consistency:"strong"} );
    const alumnos = await store.get("ranking", { type: "json" }) || [];

    const index = alumnos.findIndex((a) => a.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: "Alumno no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Update fields if provided
    if (puntos !== undefined) alumnos[index].puntos = Math.max(0, puntos);
    if (nombre !== undefined) alumnos[index].nombre = nombre.trim();
    if (avatar !== undefined) alumnos[index].avatar = avatar;

    await store.setJSON("ranking", alumnos);

    return new Response(JSON.stringify({ success: true, alumno: alumnos[index] }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
};

export const config = {
  path: "/api/update-alumno",
};
