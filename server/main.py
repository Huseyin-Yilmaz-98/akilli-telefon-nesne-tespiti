from flask import Flask, request
from google.cloud import vision, storage
import base64
import json
import io
from PIL import Image, ImageDraw, ImageFont
from datetime import date, datetime
import random

app = Flask(__name__)


@app.route('/', methods=['POST'])
def process_image():
    try:
        image_string = request.get_json()
        image_data = base64.b64decode(image_string.encode("utf-8"))
        buf = io.BytesIO(image_data)
        im = Image.open(buf)
        im = im.convert("RGB")
        width, height = im.size
        draw = ImageDraw.Draw(im)
    except Exception as e:
        return json.dumps("Failed to parse image string: " + str(e)), 400

    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_data)
        objects = client.object_localization(
            image=image).localized_object_annotations
        for obj in objects:
            vertices = obj.bounding_poly.normalized_vertices
            x, y = vertices[0].x*width, vertices[0].y*height-(height//16)
            r, g, b = im.getpixel((x, y))
            color_value = (0.2126 * r) + (0.7152 * g) + (0.0722 * b)
            text_color = (255, 255, 255) if color_value < 130 else (0, 0, 0)
            draw.rectangle([vertices[0].x*width, vertices[0].y * height, vertices[2].x *
                            width, vertices[3].y*height], width=2, outline=text_color)
            draw.text([x, y], obj.name, font=ImageFont.truetype(
                "helvetica.ttf", height//14), fill=text_color)
        object_count = len(objects)
    except Exception as e:
        return json.dumps("Failed to get object data: " + str(e)), 500

    try:
        client = storage.Client()
        bucket = client.get_bucket('object-detection-40b2d.appspot.com')
        date_string = date.today().strftime("%y.%m.%d")
        time_string = datetime.now().strftime("%H.%M.%S")
        blob = bucket.blob(
            f"{date_string}.{time_string}.{random.randint(0,9)}.jpeg")
        output = io.BytesIO()
        im.save(output, "JPEG")
        blob.upload_from_string(output.getvalue())
        blob.make_public()
        url = blob.public_url
        return json.dumps({"url": url, "count": object_count}), 200
    except Exception as e:
        return json.dumps("Failed upload image to storage: " + str(e)), 500


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
