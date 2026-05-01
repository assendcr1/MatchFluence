using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.Models;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MarketsController : Controller
    {
        private readonly ILogger<MarketsController> _logger;
        private readonly ApplicationDbContext _context;

        public MarketsController(ILogger<MarketsController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Get all Markets
        /// </summary>
        /// <returns>List of all Markets</returns>
        
        // GET: api/Markets - Retrieves a list of all Markets
        [HttpGet]
        public async Task<IActionResult> GetMarkets()
        {
            var markets = await _context.Markets.ToListAsync();
            return Ok(markets);
        }

        /// <summary>
        /// Get Market by ID
        /// </summary>
        /// <param name="id">The unique identifier of the Market</param>
        /// <returns>Returns a single Market record</returns>
        
        // GET: api/Markets/{id} - Retrieves a market by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMarketById(int id)
        {
            var markets = await _context.Markets.FindAsync(id);
            return Ok(markets);
        }

        /// <summary>
        /// Creates a new Market
        /// </summary>
        /// <param name="market">The market object to create</param>
        /// <returns>The created Market object</returns>
        
        // POST: api/Markets - Creates a new Market
        [HttpPost]
        public async Task<IActionResult> CreateMarket([FromBody] Markets market)
        {
            if (market == null)
            {
                _logger.LogWarning("Received null niche object.");
                return BadRequest("Niche data is required.");
            }

            await _context.Markets.AddAsync(market);
            await _context.SaveChangesAsync();
            return Ok(market);
        }

        /// <summary>
        /// Deletes a market by ID
        /// </summary>
        /// <param name="id">The Markets unique identifier</param>
        /// <returns></returns>
        
        // DELETE: api/Markets/{id} - Deletes a Market by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMarket(int id)
        {
            var market = await _context.Markets.FindAsync(id);
            if (market == null)
            {
                return NotFound();
            }
            _context.Markets.Remove(market);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Updates a Market
        /// </summary>
        /// <param name="id">The Markets unique identifier</param>
        /// <param name="market">The updated Market onject</param>
        /// <returns></returns>

        // PUT: api/Markets/{id} - Updates a Market by ID
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMarket(int id, [FromBody] Markets market)
        {
            var existingMarket = await _context.Markets.FindAsync(id);

            if (existingMarket == null)
            {
                _logger.LogWarning("Market with ID {id} not found for update.", id);
                return NotFound();
            }

            existingMarket.MarketName = market.MarketName;
            await _context.SaveChangesAsync();
            return Ok(existingMarket);
        }
    }
}
