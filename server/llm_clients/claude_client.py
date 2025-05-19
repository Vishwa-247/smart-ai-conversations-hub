
import os
import time

CLAUDE_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

def ask_claude(messages):
    """Send message to Claude and return response"""
    try:
        print("Starting Claude request...")
        if not CLAUDE_API_KEY:
            return "Claude API key not configured. Please set ANTHROPIC_API_KEY in environment variables."
        
        # Import here to avoid errors if package is not installed
        from anthropic import Anthropic
        
        client = Anthropic(api_key=CLAUDE_API_KEY)
        
        # Format messages for Claude API
        claude_messages = []
        for msg in messages:
            if msg["role"] == "system":
                # Claude has a special format for system messages
                system_content = msg["content"]
                continue
            elif msg["role"] == "user":
                claude_messages.append({"role": "user", "content": msg["content"]})
            elif msg["role"] == "assistant":
                claude_messages.append({"role": "assistant", "content": msg["content"]})
        
        start_time = time.time()
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1024,
            system=system_content if 'system_content' in locals() else "",
            messages=claude_messages
        )
        end_time = time.time()
        print(f"Request completed in {end_time - start_time:.2f} seconds")
        
        return response.content[0].text
    except Exception as e:
        print(f"Error in Claude service: {str(e)}")
        return f"An error occurred with Claude: {str(e)}"
