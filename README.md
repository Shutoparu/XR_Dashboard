# OvenSpace

This is a modified version of OvenSpace

## Configuration
### OvenSpace Configuration
The `ovenspace.cfg` file allows you to configure the settings needed to connect with the OvenMediaEngine from the OvenSpace.
The settings are as follows:
```python
OME_HOST = 'your.oven_media_engine.com'

OME_API_ENABLE_TLS = 'true'
OME_API_PORT = '8082'
OME_API_ACCESS_TOKEN = 'your_api_access_token'

OME_VHOST_NAME = 'default'
OME_APP_NAME = 'app'
OME_STREAM_NAME = 'stream'

OME_RTMP_PROVIDER_PORT = '1935'

OME_SRT_PROVIDER_PORT = '9999'

OME_WEBRTC_PROVIDER_ENABLE_TLS = 'true'
OME_WEBRTC_PROVIDER_PORT = '3333'

OME_WEBRTC_PUBLISHER_ENABLE_TLS = 'true'
OME_WEBRTC_PUBLISHER_PORT = '3333'

OME_LLHLS_PUBLISHER_ENABLE_TLS = 'false'
OME_LLHLS_PUBLISHER_PORT = '3333'
```
#### `OME_HOST`
Set the OvenMediaEngine's domain or IP address. For a TLS connection, set the domain.
#### `OME_API_ENABLE_TLS`
`'true'` or `'false'`. Determines whether to use TLS when calling OvenMediaEngine's [REST API](https://airensoft.gitbook.io/ovenmediaengine/rest-api#setting-up-for-using-the-apis).
#### `OME_API_PORT`
Sets the [port of OvenMediaEngine's REST API Server](https://airensoft.gitbook.io/ovenmediaengine/rest-api#port). If you set `OME_API_ENABLE_TLS` to `'true'` use  the `TLSPort` of OvenMediaEngine API Server.
#### `OME_API_ACCESS_TOKEN`
Sets the [token to be used for authentication](https://airensoft.gitbook.io/ovenmediaengine/rest-api#host-and-permissions) when calling the OvenMediEngin REST APIs.
#### `OME_VHOST_NAME`
Sets the [virtual host](https://airensoft.gitbook.io/ovenmediaengine/configuration#virtual-host) of OvenMediaEngine that OvenSpace will use.

#### `OME_APP_NAME`
Sets the [application name](https://airensoft.gitbook.io/ovenmediaengine/configuration#application) of OvenMediaEngine that OvenSpace will use.

#### `OME_STREAM_NAME`
Sets the stream name that OvenSpace will use to send or receive streams to the OvenMediaEngine. If `OME_STREAM_NAME` is set to `'stream-'`, OvenSpace sends and receives streams in the format `'stream-0'`, `'stream-1'`, `'stream-2'`.

#### `OME_RTMP_PROVIDER_PORT`
Sets the [port of RTMP Provider](https://airensoft.gitbook.io/ovenmediaengine/live-source/rtmp).

#### `OME_SRT_PROVIDER_PORT`
Sets the [port of SRT Provider](https://airensoft.gitbook.io/ovenmediaengine/live-source/srt-beta).

#### `OME_WEBRTC_PROVIDER_ENABLE_TLS`
`'true'` or `'false'`. Determines whether to use TLS when signalling with OvenMediaEngine's [WebRTC Provider](https://airensoft.gitbook.io/ovenmediaengine/live-source/webrtc-beta).

#### `OME_WEBRTC_PROVIDER_PORT`
Sets the [signalling port of WebRTC Provider](https://airensoft.gitbook.io/ovenmediaengine/live-source/webrtc-beta#bind). If you set `OME_WEBRTC_PROVIDER_ENABLE_TLS` to `'true'` use  the `TLSPort` of  [WebRTC Provider](https://airensoft.gitbook.io/ovenmediaengine/live-source/webrtc-beta).

#### `OME_WEBRTC_PUBLISHER_ENABLE_TLS`
`'true'` or `'false'`. Determines whether to use TLS when signalling with OvenMediaEngine's [WebRTC Publisher](https://airensoft.gitbook.io/ovenmediaengine/streaming/webrtc-publishing).

#### `OME_WEBRTC_PUBLISHER_PORT`
Sets the [signalling port of WebRTC Publisher](https://airensoft.gitbook.io/ovenmediaengine/streaming/webrtc-publishing#configuration). If you set `OME_WEBRTC_PUBLISHER_ENABLE_TLS` to `'true'` use  the `TLSPort` of  [WebRTC Publisher](https://airensoft.gitbook.io/ovenmediaengine/streaming/webrtc-publishing).

#### `OME_LLHLS_PUBLISHER_ENABLE_TLS`
`'true'` or `'false'`. Determines whether to use TLS when playback OvenMediaEngine's [LLHLS Publisher](https://airensoft.gitbook.io/ovenmediaengine/streaming/low-latency-hls).

#### `OME_LLHLS_PUBLISHER_PORT`
Sets the [playback port of LLHLS Publisher](https://airensoft.gitbook.io/ovenmediaengine/streaming/low-latency-hls#configuration). If you set `OME_LLHLS_PUBLISHER_ENABLE_TLS` to `'true'` use  the `TLSPort` of  [LLHLS Publisher](https://airensoft.gitbook.io/ovenmediaengine/streaming/low-latency-hls).

## License
OvenSpace is licensed under the [MIT](./LICENSE) license.