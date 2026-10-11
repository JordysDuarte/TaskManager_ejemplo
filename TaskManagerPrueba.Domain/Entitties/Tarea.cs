using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManagerPrueba.Domain.Entitties
{
	public sealed class Tarea
	{

		public int Id { get; private set; }
		public string Titulo { get; private set; }
		public bool Completada { get; private set; }

		public Tarea(int id, string titulo, bool completada)
		{
			if (id < 0)
			{
				throw new ArgumentOutOfRangeException(
					nameof(id), "El id no puede ser negativo"
					);
			}

			if (string.IsNullOrWhiteSpace(titulo))
			{
				throw new ArgumentException("El titulo es obligatorio", nameof(titulo));
			}

			Titulo = titulo.Trim();

			if (titulo.Length > 120)
			{
				throw new ArgumentException("El titulo no puede exceder los 120 caracteres", nameof(titulo));
			}


			Id = id;
			Titulo += titulo;
			Completada = completada;
		}

		public void TareaCompletada(bool completada)
		{
			Completada = completada;
		}

	}
}
