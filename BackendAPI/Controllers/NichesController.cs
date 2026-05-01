using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.Models;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NichesController : ControllerBase
    {
        private readonly ILogger<NichesController> _logger;
        private readonly ApplicationDbContext _context;

        public NichesController(ILogger<NichesController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Gets all Niches
        /// </summary>
        /// <returns>List of all Niches</returns>

        // GET: api/Niches - Retrieves a list of all Niches
        [HttpGet]
        public async Task<IActionResult> GetNiches()
        {
            var niches = await _context.Niches.ToListAsync();
            return Ok(niches);
        }

        /// <summary>
        /// Gets a Niche by id
        /// </summary>
        /// <param name="id">The Niches unique identifier</param>
        /// <returns>A single Niche</returns>
        
        // GET: api/Niches/{id} - Retrieves a Niche by its ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNicheById(int id)
        {
            var niche = await _context.Niches.FindAsync(id);
            if (niche == null)
            {
                _logger.LogWarning("Niche with ID {Id} not found.", id);
                return NotFound();
            }
            return Ok(niche);
        }

        /// <summary>
        /// Creates a new Niche
        /// </summary>
        /// <param name="niche">The Niche object to create</param>
        /// <returns>The created Niche object</returns>
        
        // POST: api/Niches - Creates a new Niche
        [HttpPost]
        public async Task<IActionResult> CreateNiche([FromBody] Niches niche)
        {
            if (niche == null)
            {
                _logger.LogWarning("Received null niche object.");
                return BadRequest("Niche data is required.");
            }

            await _context.Niches.AddAsync(niche);
            await _context.SaveChangesAsync();
            return Ok(niche);
        }

        /// <summary>
        /// Delete a Niche By ID
        /// </summary>
        /// <param name="id">The unique identifier of the Niche</param>
        /// <returns></returns>
        
        // DELETE: api/Niches/{id} - Delete a Niche by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNiche(int id)
        {
            var niche = await _context.Niches.FindAsync(id);
            if (niche == null)
            {
                _logger.LogWarning("Niche with ID {id} not found for deletion.", id);
                return NotFound();
            }
            _context.Niches.Remove(niche);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Update a Niche 
        /// </summary>
        /// <param name="id">The Niches unique identifier</param>
        /// <param name="niche">The Niche Object</param>
        /// <returns>The update Niche object</returns>
        
        // PUT: api/Niche/{id} - Update a Niche Object
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNiche(int id, [FromBody] Niches niche)
        {
            var existingNiche = await _context.Niches.FindAsync(id);
            if (existingNiche == null)
            {
                _logger.LogWarning("Niche with ID {id} not found for update.", id);
                return NotFound();
            }

            existingNiche.NicheName = niche.NicheName;
            await _context.SaveChangesAsync();
            return Ok(existingNiche);
        }
    }
}
