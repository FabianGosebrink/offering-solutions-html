---
title: Starting with Angular and Microsoft's Face Recognition API
date: 2018-04-23
tags: ['angular', 'microsoft', 'faceapi']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: [
    "/blog/articles/2018/04/23/starting-with-angular-and-microsoft-face-recognition-api/",
]
---

In this blogpost I want to give you a guidance to the first steps of starting with Microsoft's Face Recognition API and using it with Angular and the Angular CLI.

## Preparation

The first thing you need is a FaceAPI key which you can get here [FaceAPI](https://azure.microsoft.com/en-us/services/cognitive-services/face/). You can login with your Microsoft, LinkedIn, GitHub or Facebook account to get one.

Another useful links are:

- [Obtaining Subscription Keys](https://docs.microsoft.com/de-de/azure/cognitive-services/computer-vision/vision-api-how-to-topics/howtosubscribe)
- [Face API JavaScript Quickstarts](https://docs.microsoft.com/de-de/azure/cognitive-services/Face/quickstarts/javascript)
- [Api Documentation - Face API - V1.0](https://westcentralus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395236)

The complete sourcecode for this blogpost can be found in my [GitHub](https://github.com/FabianGosebrink/angular-face-recognition-api). It is based on the Angular CLI and Bootstrap 4.

## The goal

The goal of this blogpost or this private project I did was to consume the face recognition API sending a picture to it which you can capture with the camera of your laptop/ computer and then to analyze it and siaply the results.

## Questions to clarify

The questions I faced prior to this project were:

- How do I communicate with the Face API?
- How can I take a picture and POST it?
- How can I read the response and display it?
- How can I do all this with Angular

## Lets get coding

The first thing I took a look at was the communication with the API. If we see the example from [https://docs.microsoft.com/de-de/azure/cognitive-services/Face/quickstarts/javascript](https://docs.microsoft.com/de-de/azure/cognitive-services/Face/quickstarts/javascript)

```javascript
var uriBase =
  'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';

// Request parameters.
var params = {
  returnFaceId: 'true',
  returnFaceLandmarks: 'false',
  returnFaceAttributes:
    'age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
};

// Display the image.
var sourceImageUrl = document.getElementById('inputImage').value;
document.querySelector('#sourceImage').src = sourceImageUrl;

// Perform the REST API call.
$.ajax({
  url: uriBase + '?' + $.param(params),

  // Request headers.
  beforeSend: function(xhrObj) {
    xhrObj.setRequestHeader('Content-Type', 'application/json');
    xhrObj.setRequestHeader('Ocp-Apim-Subscription-Key', subscriptionKey);
  },

  type: 'POST',

  // Request body.
  data: '{"url": ' + '"' + sourceImageUrl + '"}'
});
```

we do fire a request to an endpoint with specific parameters, headers and a body which is an object with a source URL as a value of a property called "data". So we can easily do that with angular as well like:

```javascript
private getHeaders(subscriptionKey: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/octet-stream');
    headers = headers.set('Ocp-Apim-Subscription-Key', subscriptionKey);

    return headers;
}

private getParams() {
const httpParams = new HttpParams()
    .set('returnFaceId', 'true')
    .set('returnFaceLandmarks', 'false')
    .set(
        'returnFaceAttributes',
        'age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
    );

    return httpParams;

}
```

But if we take a picture with a service from the camera we do not save it and have it as a image directly but instead we have a base64 representation of this image.

```javascript
const context = canvasElement.getContext('2d');
context.drawImage(
  videoElement,
  0,
  0,
  videoElement.videoWidth,
  videoElement.videoHeight
);

const url = canvasElement.toDataURL('image/png'); // base64 here
```

so the challenge here was to not send the URL in the body to the face api but taking the base64 image representation. We can send blobs to an API which is not difficult through the new HttpClient Angular provides us. I tried and searched a bit and found the SO answers which I shared in the "links" section at the end of this article. I modified them a bit and covered them in a service so this method here takes care of generating the correct blob:

```javascript
private makeblob(dataURL) {
    const BASE64_MARKER = ';base64,';
    const parts = dataURL.split(BASE64_MARKER);
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}
```

As we have the headers, the parameters and the body now we can set up a simple http call to the API with angular passing the subscriptionkey and the base64 representation of the image like:

```javascript
scanImage(subscriptionKey: string, base64Image: string) {
    const headers = this.getHeaders(subscriptionKey);
    const params = this.getParams();
    const blob = this.makeblob(base64Image);

    return this.httpClient.post<FaceRecognitionResponse>(
        environment.endpoint,
        blob,
        {
            params,
            headers
        }
    );
}
```

You can see the full service here [https://github.com/FabianGosebrink/angular-face-recognition-api/blob/master/src/app/services/face-recognition.service.ts](https://github.com/FabianGosebrink/angular-face-recognition-api/blob/master/src/app/services/face-recognition.service.ts).

Having that set up let's take a look at the response we get back from the API.

```javascript
[
    {
        "faceId": "...",
        "faceRectangle": {
            ...
        },
        "faceAttributes": {
            "smile": 0,
            "headPose": {
                ...
            },
            "gender": "male",
            "age": 32.1,
            "facialHair": {
                ...
            },
            "glasses": "NoGlasses",
            "emotion": {
                ...
            },
            "blur": {
                ...
            },
            "exposure": {
                    ...
            },
            "noise": {
                ...
            },
            "makeup": {
                ...
            },
            "accessories": [],
            "occlusion": {
                ...
            },
            "hair": {
                ...
            }
        }
    }
]
```

That's a lot of information we get back as JSON. So we can easily cast it in our Typescript object to work with it. So we can ask the camera service to get the photo, use a switchmap to ask the facerecognitionservice to work with the data and give back the result.

```javascript
faceApiResponse: Observable<FaceRecognitionResponse>;

@Component(...)

processImage() {
    if (!this.subscriptionKey) {
        return;
    }

    this.faceApiResponse = this.cameraService.getPhoto().pipe(
      switchMap(base64Image => {
        this.imageString = base64Image;
        return this.faceRecognitionService.scanImage(
          this.subscriptionKey,
          base64Image
        );
      })
    );

}
```

We can use this response then to pass and display it in a table format like

`<app-table [faceApiResponse]="response"></app-table>`

You can browse all the source code in the repository [here](https://github.com/FabianGosebrink/angular-face-recognition-api).

## The result

The result is an application which takes a picture, sends it to an API and then displays the result in a table but you can also see the full response if you want.
Have fun :)

![AngularFaceRecoginitionApi](/img/articles/2018-04-28/2018-04-28-13_36_07-AngularFaceRecoginitionApi.jpg)

## Links

[https://stackoverflow.com/questions/34047648/how-to-post-an-image-in-base64-encoding-via-ajax/34064793#34064793](https://stackoverflow.com/questions/34047648/how-to-post-an-image-in-base64-encoding-via-ajax/34064793#34064793)

[https://stackoverflow.com/questions/37900554/microsoft-cognitive-services-uploading-image](https://stackoverflow.com/questions/37900554/microsoft-cognitive-services-uploading-image)

[https://github.com/FabianGosebrink/angular-face-recognition-api](https://github.com/FabianGosebrink/angular-face-recognition-api)

Cheers

Fabian
