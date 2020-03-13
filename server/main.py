import asyncio
from json import dumps
from threading import Thread
from quart import Quart, websocket, render_template, copy_current_websocket_context, request
from quart_cors import cors
from functools import wraps

app = Quart(__name__)
app = cors(app, allow_origin="*")
connected = set()


@app.route("/")
async def home():
    return await render_template('index.html')


def collect_websocket(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        global connected
        connected.add(websocket._get_current_object())
        try:
            return await func(*args, **kwargs)
        finally:
            connected.remove(websocket._get_current_object())

    return wrapper


async def consumer():
    while True:
        data = await websocket.receive()
        if data == 'linked':
            await websocket.send(dumps({'message': 'linked'}))



@app.websocket('/ws')
async def ws():
    consumer_task = asyncio.ensure_future(copy_current_websocket_context(consumer)(), )
    try:
        await asyncio.gather(consumer_task, )
    finally:
        consumer_task.cancel()


@app.route("/api/demographics/")
async def demographics():
    return 'info'


if __name__ == '__main__':
    # em = Main().start()
    app.run(debug=True, host='127.0.0.1', port=8000)
