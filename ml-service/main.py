from fastapi import FastAPI, Request
import anthropic
import os

app = FastAPI()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@app.post("/analyze")
async def analyze(request: Request):
    body = await request.json()
    code = body.get("code")
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=512,
        messages=[
            {"role": "user", "content": f"Review this code for bugs and improvements. Be concise:\n\n{code}"}
        ]
    )
    
    result = message.content[0].text
    return {"result": result}
