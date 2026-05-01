using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;
namespace BackendAPI.Controllers
{
    [ApiController] // Tells .NET this class is a controller
    [Route("api/[controller]")] //defines the endpoint for this controller. Since thi controller is called instagram,the URL becomes api/instagram

    public class InstagramController : ControllerBase {  // creates a controller called instagram
        private readonly IInstagramService _instagramService;   //

        public InstagramController(IInstagramService instagramService) {  
            _instagramService = instagramService;   // implements/injects instagram services into this controller WHY??
        }

        //The profile endpoint

        //endpoint: GET api/instagram/profile/{userId}
        [HttpGet("profile/{userId}")]

        //calls the instagram service method
        public async Task<IActionResult> GetProfile(string userId) {
            //calls the GetProfileAsync method from the instagram service, which sends a request to get an Instagram profile using Id and return data based on specificied fields.
            var profile = await _instagramService.GetProfileAsync(userId);

            if (profile == null) { 
                return NotFound("Profile not found or API returned empty.");
            }
            return Ok(profile);  // returns the profile data along a 200 OK code.
        }

        //Content type/Media endpoint
        [HttpGet("media/{userId}")]
        public async Task<IActionResult> GetMedia(string userId)
        {
            //calls the GetMediaAsync method from the instagram service to get a specific post data
            var media = await _instagramService.GetMediaAsync(userId);
            return Ok(media); 
        }

        
        [HttpGet("media-insights/{mediaId}")]
        public async Task<IActionResult> GetMediaInsights(string mediaId) { 

            var insights = await _instagramService.GetMediaInsightsAsync(mediaId);

            if (insights == null) {
                //sends a 404 HTTP response with message below
                return BadRequest("Could not retrieve media insights.");
            }

            return Ok(insights);
        }

        [HttpGet("account-insights/{userId}")]
        public async Task<IActionResult> GetAccountInsights(string userId) { 
            var insights = await _instagramService.GetAccountInsightsAsync(userId);

            if (insights == null) {
                return BadRequest("Could not retrieve account insights.");
            }

            return Ok(insights);
        }


    }
}
