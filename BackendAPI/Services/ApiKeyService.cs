using System.Security.Cryptography;
using System.Text;

namespace BackendAPI.Services
{
    // Handles API key generation and validation.
    // Keys are generated as random base64 strings and stored as SHA256 hashes.
    // The raw key is shown to the user ONCE on registration — never again.
    public class ApiKeyService
    {
        // Generates a new raw API key — shown to user once, never stored
        public string GenerateApiKey()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }

        // Hashes the raw key for storage — only the hash lives in the DB
        public string HashApiKey(string rawKey)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawKey));
            return Convert.ToHexString(bytes).ToLower();
        }

        // Validates an incoming key against a stored hash
        public bool ValidateApiKey(string rawKey, string storedHash)
        {
            var hash = HashApiKey(rawKey);
            return hash == storedHash;
        }
    }
}
