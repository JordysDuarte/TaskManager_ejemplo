using TaskManagerPrueba.Infrastructure.Persistence;
using TaskManagerPrueba.Application.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ITareaRepository, TareaRepository>();


var app = builder.Build();

app.MapGet("/", () => "Hello World!");



app.Run();
