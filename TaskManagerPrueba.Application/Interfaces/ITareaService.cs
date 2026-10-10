
using MiniTask.Application.DTOs;
using MiniTask.Application.Interfaces;
using MiniTask.Domain.Entities;
using TaskManagerPrueba.Application.DTOs;
using TaskManagerPrueba.Application.Interfaces;
using TaskManagerPrueba.Application.Services;

namespace MiniTask.Application.Services;

public sealed class TareaService : ITareaService
{
    private readonly ITareaRepository _repositorio;

    public TareaService(ITareaRepository repositorio)
    {
        _repositorio = repositorio
            ?? throw new ArgumentNullException(nameof(repositorio));
    }

    // 1. Consultar todas las tareas
    public async Task<IReadOnlyList<TareaDto>> ListarAsync(
        CancellationToken ct = default)
    {
        var tareas = await _repositorio.ListarAsync(ct);

        return tareas
            .Select(Mapear)
            .ToList();
    }

    // 2. Consultar una tarea por ID
    public async Task<TareaDto?> ObtenerPorIdAsync(
        int id,
        CancellationToken ct = default)
    {
        if (id <= 0)
            return null;

        var tarea = await _repositorio.ObtenerPorIdAsync(
            id, ct);

        if (tarea is null)
            return null;

        return Mapear(tarea);
    }

    // 3. Registrar una tarea
    public async Task<TareaDto> CrearAsync(
        CrearTareaDto datos,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(datos);

        var tarea = new Tarea(
            0,
            datos.Titulo ?? string.Empty
        );

        int idGenerado = await _repositorio.CrearAsync(
            tarea, ct);

        return new TareaDto(
            idGenerado,
            tarea.Titulo,
            tarea.Completada
        );
    }

    // 4. Cambiar estado de una tarea
    public async Task<bool> CambiarEstadoAsync(
        int id,
        CambiarEstadoDto datos,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(datos);

        if (id <= 0)
            return false;

        var tarea = await _repositorio.ObtenerPorIdAsync(
            id, ct);

        if (tarea is null)
            return false;

        tarea.CambiarEstado(datos.Completada);

        return await _repositorio.ActualizarAsync(
            tarea, ct);
    }

    // 5. Eliminar una tarea
    public async Task<bool> EliminarAsync(
        int id,
        CancellationToken ct = default)
    {
        if (id <= 0)
            return false;

        return await _repositorio.EliminarAsync(id, ct);
    }

    // Convertir entidad del dominio a DTO
    private static TareaDto Mapear(Tarea tarea)
    {
        return new TareaDto(
            tarea.Id,
            tarea.Titulo,
            tarea.Completada
        );
    }
}
