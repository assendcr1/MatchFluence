namespace BackendAPI.Models.DTO
{
    //DTO's are used to transfer data
    public class SendMessageRequest
    {
        public Guid CampaignId { get; set; }
        public Guid InfluencerId { get; set; }
        public string MessageType { get; set; }
    }
}
