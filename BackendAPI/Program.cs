using BackendAPI.Auth;
using BackendAPI.Data;
using BackendAPI.Services;
using BackendAPI.Services.Discovery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// CORS — open during pilot, lock down after launch
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
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
