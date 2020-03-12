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
        if data == 'age_sex':
            await websocket.send(dumps({'bla': True}))


async def producer():
    global clean_emotions
    while True:
        await asyncio.sleep(1)
        clean_emotions_str = dumps(dumps({'bla': True}))
        print('gave emotions', clean_emotions_str)
        if len(clean_emotions_str) > 5:
            await websocket.send(clean_emotions_str)


@app.websocket('/ws')
async def ws():
    consumer_task = asyncio.ensure_future(copy_current_websocket_context(consumer)(), )
    producer_task = asyncio.ensure_future(copy_current_websocket_context(producer)(), )
    try:
        await asyncio.gather(consumer_task, producer_task)
    finally:
        consumer_task.cancel()
        producer_task.cancel()


@app.route("/api/demographics/")
async def demographics():
    return 'info'


if __name__ == '__main__':
    # em = Main().start()
    app.run(debug=True, host='127.0.0.1', port=8000)
