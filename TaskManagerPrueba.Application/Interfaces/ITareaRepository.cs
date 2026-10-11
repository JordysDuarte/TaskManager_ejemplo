using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManagerPrueba.Domain.Entitties;

namespace TaskManagerPrueba.Application.Interfaces
{
    public interface ITareaRepository
    {
        Task<IReadOnlyList<Tarea>> ListarAsync(
                CancellationToken ct = default
            );

        Task<Tarea?> ObtenerPorIdAsync(
                int id,
                CancellationToken ct = default
            );

        Task<int> CrearAsync(
                Tarea tarea,
                CancellationToken ct = default
            );

        Task<bool> ActualizarAsync(
                Tarea tarea,
                CancellationToken ct = default
            );

        Task<bool> EliminarAsync(
                int id,
                CancellationToken ct = default
            );
    }
}
