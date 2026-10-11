using TaskManagerPrueba.Application.DTOs;

namespace TaskManagerPrueba.Application.Interfaces;

public interface ITareaService
{
    Task<IReadOnlyList<TareaDto>> ListarAsync(
        CancellationToken ct = default);

    Task<TareaDto?> ObtenerPorIdAsync(
        int id,
        CancellationToken ct = default);

    Task<TareaDto> CrearAsync(
        CrearTareaDto datos,
        CancellationToken ct = default);

    Task<bool> CambiarEstadoAsync(
        int id,
        CambiarEstadoDto datos,
        CancellationToken ct = default);

    Task<bool> EliminarAsync(
        int id,
        CancellationToken ct = default);
}
