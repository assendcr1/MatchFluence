using BackendAPI.Models.DTO;

namespace BackendAPI.Services
{
    // Swappable interface — MVP uses OllamaReasoningService (free, local).
    // When funded, swap registration in Program.cs to ClaudeReasoningService.
    // Nothing else in the codebase changes.
    public interface IAIReasoningService
    {
        Task<string?> GenerateReasonAsync(MatchRequest request, MatchResult result);
    }
}
