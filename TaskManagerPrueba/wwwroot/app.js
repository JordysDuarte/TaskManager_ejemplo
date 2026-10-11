
"use strict";

// ========================================
// 1. CONFIGURACIÓN Y ELEMENTOS DEL DOM
// ========================================

const API_URL = "/api/tareas";

const formulario = document.getElementById("formTarea");
const campoTitulo = document.getElementById("tituloTarea");
const botonAgregar = document.getElementById("btnAgregar");

const listaTareas = document.getElementById("listaTareas");
const mensajeSistema = document.getElementById("mensajeSistema");

const totalTareas = document.getElementById("totalTareas");
const totalPendientes = document.getElementById("totalPendientes");
const totalCompletadas = document.getElementById("totalCompletadas");

const botonesFiltro = document.querySelectorAll("[data-filtro]");

// Datos y filtro actual
let tareas = [];
let filtroActual = "todas";


// ========================================
// 2. MOSTRAR MENSAJES
// ========================================

function mostrarMensaje(texto, tipo = "exito") {
    mensajeSistema.textContent = texto;
    mensajeSistema.className = "mensaje";

    if (texto) {
        mensajeSistema.classList.add(`mensaje-${tipo}`);
    }
}


// ========================================
// 3. FUNCIÓN GENERAL PARA CONSUMIR LA API
// ========================================

async function solicitarApi(url, opciones = {}) {
    let respuesta;

    try {
        respuesta = await fetch(url, opciones);
    } catch {
        throw new Error(
            "No se pudo conectar con el servidor."
        );
    }

    let datos = null;

    const tipoContenido =
        respuesta.headers.get("content-type") ?? "";

    // No intentamos leer JSON de respuestas vacías.
    if (
        respuesta.status !== 204 &&
        tipoContenido.includes("json")
    ) {
        datos = await respuesta.json();
    }

    if (!respuesta.ok) {
        const mensaje =
            datos?.mensaje ??
            datos?.title ??
            `Error HTTP ${respuesta.status}`;

        throw new Error(mensaje);
    }

    return datos;
}


// ========================================
// 4. ACTUALIZAR CONTADORES
// ========================================

function actualizarContadores() {
    const completadas = tareas.filter(
        tarea => tarea.completada
    ).length;

    const pendientes = tareas.length - completadas;

    totalTareas.textContent = tareas.length;
    totalPendientes.textContent = pendientes;
    totalCompletadas.textContent = completadas;
}


// ========================================
// 5. MOSTRAR LAS TAREAS EN PANTALLA
// ========================================

function mostrarTareas() {
    listaTareas.replaceChildren();

    actualizarContadores();

    // Aplicar filtro seleccionado.
    const tareasFiltradas = tareas.filter(tarea => {
        if (filtroActual === "pendientes") {
            return !tarea.completada;
        }

        if (filtroActual === "completadas") {
            return tarea.completada;
        }

        return true;
    });

    // Mostrar mensaje cuando no hay tareas.
    if (tareasFiltradas.length === 0) {
        const elemento = document.createElement("li");

        elemento.className = "estado-vacio";
        elemento.textContent =
            "No hay tareas para mostrar.";

        listaTareas.appendChild(elemento);
        return;
    }

    // Crear elementos HTML para cada tarea.
    tareasFiltradas.forEach(tarea => {

        const elemento = document.createElement("li");
        elemento.className = "tarea";

        const contenido = document.createElement("div");
        contenido.className = "tarea-contenido";

        const indicador = document.createElement("span");
        indicador.className = "indicador";
        indicador.setAttribute("aria-hidden", "true");
        indicador.textContent =
            tarea.completada ? "✓" : "○";

        if (tarea.completada) {
            indicador.classList.add("completada");
        }

        const titulo = document.createElement("strong");
        titulo.className = "tarea-titulo";
        titulo.textContent = tarea.titulo;

        if (tarea.completada) {
            titulo.classList.add("completada");
        }

        contenido.append(indicador, titulo);

        // Contenedor de botones
        const acciones = document.createElement("div");
        acciones.className = "tarea-acciones";

        // Botón de cambio de estado
        const botonEstado = document.createElement("button");

        botonEstado.type = "button";
        botonEstado.className = "btn btn-secundario";
        botonEstado.dataset.accion = "estado";
        botonEstado.dataset.id = tarea.id;

        botonEstado.textContent = tarea.completada
            ? "Pendiente"
            : "Completar";

        // Botón para eliminar
        const botonEliminar = document.createElement("button");

        botonEliminar.type = "button";
        botonEliminar.className = "btn btn-peligro";
        botonEliminar.dataset.accion = "eliminar";
        botonEliminar.dataset.id = tarea.id;
        botonEliminar.textContent = "Eliminar";

        acciones.append(botonEstado, botonEliminar);
        elemento.append(contenido, acciones);

        listaTareas.appendChild(elemento);
    });
}


// ========================================
// 6. CONSULTAR TAREAS - GET
// ========================================

async function cargarTareas() {
    const resultado = await solicitarApi(API_URL);

    if (!Array.isArray(resultado)) {
        throw new Error(
            "La respuesta del servidor no es una lista válida."
        );
    }

    tareas = resultado;

    mostrarTareas();
}


// ========================================
// 7. REGISTRAR TAREA - POST
// ========================================

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();

    if (!titulo || titulo.length > 120) {
        mostrarMensaje(
            "Escribe un título válido de hasta 120 caracteres.",
            "error"
        );
        return;
    }

    botonAgregar.disabled = true;

    try {
        await solicitarApi(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                titulo: titulo
            })
        });

        formulario.reset();

        await cargarTareas();

        mostrarMensaje(
            "Tarea registrada correctamente."
        );

        campoTitulo.focus();

    } catch (error) {
        mostrarMensaje(error.message, "error");

    } finally {
        botonAgregar.disabled = false;
    }
});


// ========================================
// 8. COMPLETAR O ELIMINAR TAREAS
// ========================================

listaTareas.addEventListener("click", async evento => {

    const boton = evento.target.closest(
        "button[data-accion]"
    );

    if (!boton || !listaTareas.contains(boton)) {
        return;
    }

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (!Number.isInteger(id) || id <= 0) {
        return;
    }

    const tarea = tareas.find(t => t.id === id);

    if (!tarea) {
        return;
    }

    // Confirmar la eliminación.
    if (accion === "eliminar") {
        const confirmado = confirm(
            `¿Deseas eliminar la tarea "${tarea.titulo}"?`
        );

        if (!confirmado) {
            return;
        }
    }

    if (accion !== "estado" && accion !== "eliminar") {
        return;
    }

    boton.disabled = true;

    try {
        let mensaje;

        if (accion === "estado") {

            await solicitarApi(`${API_URL}/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    completada: !tarea.completada
                })
            });

            mensaje = "Estado actualizado correctamente.";

        } else {

            await solicitarApi(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            mensaje = "Tarea eliminada correctamente.";
        }

        await cargarTareas();
        mostrarMensaje(mensaje);

    } catch (error) {
        mostrarMensaje(error.message, "error");

    } finally {
        boton.disabled = false;
    }
});


// ========================================
// 9. FILTRAR TAREAS
// ========================================

botonesFiltro.forEach(boton => {

    boton.addEventListener("click", () => {

        filtroActual = boton.dataset.filtro;

        botonesFiltro.forEach(elemento => {
            const seleccionado =
                elemento === boton;

            elemento.classList.toggle(
                "activo",
                seleccionado
            );

            elemento.setAttribute(
                "aria-pressed",
                String(seleccionado)
            );
        });

        mostrarTareas();
    });
});


// ========================================
// 10. CARGA INICIAL
// ========================================

cargarTareas().catch(error => {

    listaTareas.replaceChildren();

    const elemento = document.createElement("li");
    elemento.className = "estado-vacio";
    elemento.textContent =
        "No se pudieron cargar las tareas.";

    listaTareas.appendChild(elemento);

    mostrarMensaje(error.message, "error");
});
