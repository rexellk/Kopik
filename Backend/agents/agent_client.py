"""
Client script to interact with the Kopik Intelligence Agent
This can be used to trigger analysis or receive agent responses
"""

from uagents import Agent, Context
from intelligence_agent import AnalysisRequest, AnalysisResponse
import asyncio

# Create a client agent to communicate with the intelligence agent
client_agent = Agent(
    name="kopik_client",
    seed="kopik_client_seed_456",
    port=8002,
    endpoint=["http://localhost:8002/submit"]
)

INTELLIGENCE_AGENT_ADDRESS = "agent1qwquu2d237gntfugrnwch38g8jkl3f0d93dqx3akqzulvjzk2az5wasmnqt"  # This will be generated when you run the intelligence agent

@client_agent.on_startup()
async def startup(ctx: Context):
    """Initialize client on startup"""
    ctx.logger.info("Kopik Client Agent starting up...")

async def request_analysis(use_api: bool = False, api_url: str = "http://localhost:8000"):
    """Request an analysis from the intelligence agent"""
    request = AnalysisRequest(
        use_api=use_api,
        api_base_url=api_url
    )

    # Send request to intelligence agent
    await client_agent.send(INTELLIGENCE_AGENT_ADDRESS, request)

@client_agent.on_message(AnalysisResponse)
async def handle_analysis_response(ctx: Context, sender: str, msg: AnalysisResponse):
    """Handle response from intelligence agent"""
    ctx.logger.info(f"Received analysis from {sender}")
    ctx.logger.info(f"Summary: {msg.summary}")
    ctx.logger.info(f"Alerts: {len(msg.alerts)}")
    ctx.logger.info(f"Solutions: {len(msg.solutions)}")

    # Print detailed results
    print("\n" + "="*50)
    print(f"KOPIK INTELLIGENCE ANALYSIS")
    print("="*50)
    print(f"Timestamp: {msg.timestamp}")
    print(f"Data Source: {msg.data_source}")
    print(f"Summary: {msg.summary}")

    if msg.alerts:
        print(f"\nALERTS ({len(msg.alerts)}):")
        print("-" * 30)
        for i, alert in enumerate(msg.alerts, 1):
            print(f"{i}. [{alert.priority.upper()}] {alert.type}: {alert.message}")

    if msg.solutions:
        print(f"\nSOLUTIONS ({len(msg.solutions)}):")
        print("-" * 30)
        for i, solution in enumerate(msg.solutions, 1):
            profit_text = f" (${solution.profit_impact:.2f} impact)" if solution.profit_impact else ""
            print(f"{i}. [{solution.confidence}% confidence] {solution.description}{profit_text}")

    print("="*50)

if __name__ == "__main__":
    # Example usage
    async def main():
        # Start the client agent
        client_agent.run()

    asyncio.run(main())