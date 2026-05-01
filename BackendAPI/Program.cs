using BackendAPI.Auth;
using BackendAPI.Data;
using BackendAPI.Services;
using BackendAPI.Services.Discovery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
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

// CORS must be first — before auth, before routing
app.UseCors("AllowFrontend");

// NO app.UseHttpsRedirection() — Railway handles HTTPS at load balancer
// Removing this fixes preflight OPTIONS requests being redirected

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// v1777635337

// v1777635458
