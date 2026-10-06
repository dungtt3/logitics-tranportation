using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Liveness: the process is up and serving requests. It must not depend on external systems,
// otherwise an outage of PostgreSQL/Redis would make the orchestrator restart healthy API instances.
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });

// Readiness: the instance can serve traffic. Dependency checks are registered with the "ready" tag.
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains(HealthCheckTags.Ready),
});

app.Run();

internal static class HealthCheckTags
{
    public const string Ready = "ready";
}
