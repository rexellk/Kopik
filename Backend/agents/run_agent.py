#!/usr/bin/env python3
"""
Startup script for the Kopik Intelligence Agent system
This script can run the intelligence agent, client, or both
"""

import asyncio
import argparse
import sys
import os
from multiprocessing import Process

# Add parent directory to path to import from Backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_intelligence_agent():
    """Run the intelligence agent"""
    from intelligence_agent import intelligence_agent
    print("Starting Kopik Intelligence Agent...")
    intelligence_agent.run()

def run_client_agent():
    """Run the client agent"""
    from agent_client import client_agent
    print("Starting Kopik Client Agent...")
    client_agent.run()

async def trigger_analysis():
    """Trigger a one-time analysis"""
    from agent_client import request_analysis
    print("Triggering intelligence analysis...")
    await request_analysis(use_api=False)

def main():
    parser = argparse.ArgumentParser(description="Kopik Intelligence Agent System")
    parser.add_argument(
        "mode",
        choices=["agent", "client", "both", "analyze"],
        help="Mode to run: 'agent' (intelligence agent), 'client' (client agent), 'both' (both agents), 'analyze' (trigger analysis)"
    )
    parser.add_argument(
        "--api",
        action="store_true",
        help="Use API mode instead of direct database access (for analyze mode)"
    )
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="API base URL (default: http://localhost:8000)"
    )

    args = parser.parse_args()

    if args.mode == "agent":
        run_intelligence_agent()
    elif args.mode == "client":
        run_client_agent()
    elif args.mode == "both":
        # Run both agents in separate processes
        print("Starting both agents...")
        intelligence_process = Process(target=run_intelligence_agent)
        client_process = Process(target=run_client_agent)

        intelligence_process.start()
        client_process.start()

        try:
            intelligence_process.join()
            client_process.join()
        except KeyboardInterrupt:
            print("\nShutting down agents...")
            intelligence_process.terminate()
            client_process.terminate()
            intelligence_process.join()
            client_process.join()
    elif args.mode == "analyze":
        # Trigger a one-time analysis
        asyncio.run(trigger_analysis())

if __name__ == "__main__":
    main()