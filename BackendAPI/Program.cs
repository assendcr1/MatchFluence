using BackendAPI.Auth;
using BackendAPI.Data;
using BackendAPI.Services;
using BackendAPI.Services.Discovery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers & Swagger ────────────────────────────────────────────────────
builder.Services.AddControllers();

builder.Services.AddSwaggerGen(c =>
{
    var xmlPath = Path.Combine(AppContext.BaseDirectory,
        $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// ── CORS — allow frontend domains ────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",                    // local dev
                "https://localhost:5173",
                builder.Configuration["AllowedOrigins"] ?? "" // set in Railway env
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ── Database — PostgreSQL / Supabase ─────────────────────────────────────────
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Authentication — API key scheme ──────────────────────────────────────────
builder.Services.AddAuthentication(ApiKeyAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(
        ApiKeyAuthenticationHandler.SchemeName, null);
builder.Services.AddAuthorization();

// ── Core services ────────────────────────────────────────────────────────────
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient<IInstagramService, InstagramService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<ApiKeyService>();

// ── Matching engine ──────────────────────────────────────────────────────────
builder.Services.AddScoped<IMatchingService, MatchingService>();
builder.Services.AddScoped<IAIReasoningService, TemplateReasoningService>();

// ── Data refresh + discovery ──────────────────────────────────────────────────
builder.Services.AddSingleton<BotScoreCalculator>();
builder.Services.AddScoped<IInfluencerRefreshService, InfluencerRefreshService>();
builder.Services.AddHttpClient<IInfluencerDiscoveryService, InfluencerDiscoveryService>();
builder.Services.AddHostedService<DataRefreshBackgroundService>();

// ── Build ────────────────────────────────────────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
