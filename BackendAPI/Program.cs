using BackendAPI.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
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

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var secret = builder.Configuration["JwtSettings:Secret"] ?? "FALLBACK_SECRET_CHANGE_IN_PRODUCTION";
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "MatchFluence",
        ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "MatchFluenceUsers",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
    };
})
.AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(
    ApiKeyAuthenticationHandler.SchemeName, null);
builder.Services.AddAuthorization();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IInstagramService, InstagramService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<ApiKeyService>();
builder.Services.AddScoped<IMatchingService, MatchingService>();
builder.Services.AddScoped<IAIReasoningService, GeminiReasoningService>();
builder.Services.AddScoped<GeminiReasoningService>();
builder.Services.AddScoped<BackendAPI.Services.Discovery.GeminiClassificationService>();
builder.Services.AddSingleton<BotScoreCalculator>();
builder.Services.AddScoped<IInfluencerRefreshService, InfluencerRefreshService>();
builder.Services.AddScoped<IInfluencerDiscoveryService, InfluencerDiscoveryService>();
builder.Services.AddScoped<InfluencerClassifier>();
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
