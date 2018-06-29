# RoboScape Provisioning Tool
wifi provisioning

- wifi direct (p2p)
  - native
  - plugin: https://github.com/NeoLSN/cordova-plugin-wifi-direct, https://github.com/Uepaa-AG/p2pkit-cordova
- viral solution


## Installation
- add the wifidirect plugin `cordova plugin add https://github.com/NeoLSN/cordova-plugin-wifi-direct`

## TODO
- [x] prompt for location permission
- test connectivity with xbee chip
- figure out a communication protocol after the p2p group is up
    If you are the groupOwner => Listen for a connection; Else create a connection to the owner with the ip address.

If you are the groupOwner => Listen for a connection
- what determines the group owner in WIFI Direct standard [paer](https://ieeexplore.ieee.org/document/7777908/)
- UI for controlling and connecting to discovered nodes and configuring the settings

# References
- Xbee Api Mode:
[supported frames](https://www.digi.com/resources/documentation/Digidocs/90001942-13/reference/r_supported_frames_zigbee.htm?TocPath=XBee%20API%20mode%7C_____3)
[API frame structure](https://www.digi.com/resources/documentation/Digidocs/90001456-13/concepts/c_api_frame_structure.htm?TocPath=XBee%20API%20mode%7C_____2)
[commands table](http://widi.lecturer.pens.ac.id/Praktikum/Praktikum%20Mikro/XBee_ZB_ZigBee_AT_Commands.pdf)
[s6b commands p147](https://www.digi.com/resources/documentation/digidocs/PDFs/90002180.pdf)

- Android hotspot:
  - No public/official api to create such a hotspot [link].
  - there is localOnlyHotspot [link](https://developer.android.com/reference/android/net/wifi/WifiManager#startLocalOnlyHotspot(android.net.wifi.WifiManager.LocalOnlyHotspotCallback,%20android.os.Handler)). can't preset the configurations
  - The Android API does not expose a way to modify the hotspot configurations. Can't set password or ssid and it changes everytime.
