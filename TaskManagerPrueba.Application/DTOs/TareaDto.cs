using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManagerPrueba.Application.DTOs
{
	public sealed record TareaDto(
			int Id,
			string Titulo,
			bool Completada
		);
}
