using BackendAPI.Auth;
using BackendAPI.Data;
using BackendAPI.Services;
using BackendAPI.Services.Discovery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// CORS — allow frontend
var allowedOrigins = builder.Configuration["AllowedOrigins"]?.Split(',')
    .Select(o => o.Trim())
    .Where(o => !string.IsNullOrEmpty(o))
    .ToArray() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (allowedOrigins.Length > 0)
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        else
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(ApiKeyAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(
        ApiKeyAuthenticationHandler.SchemeName, null);
builder.Services.AddAuthorization();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient<IInstagramService, InstagramService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<ApiKeyService>();
builder.Services.AddScoped<IMatchingService, MatchingService>();
builder.Services.AddScoped<IAIReasoningService, TemplateReasoningService>();
builder.Services.AddSingleton<BotScoreCalculator>();
builder.Services.AddScoped<IInfluencerRefreshService, InfluencerRefreshService>();
builder.Services.AddHttpClient<IInfluencerDiscoveryService, InfluencerDiscoveryService>();
builder.Services.AddHostedService<DataRefreshBackgroundService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
