from fastapi import FastAPI

app=FastAPI()

@app.post('/url')
def url():
    pass

