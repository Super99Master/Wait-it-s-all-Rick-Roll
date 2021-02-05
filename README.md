# Wait, it's all Rick Roll? Always has been.
WIARR is a google extension that redirect all youtube videos to "Rick Astley - Never Gonna Give You Up"
without actually redirecting.
The objective is to have the page of the video choosen (the one in the link) but the player playing NGGYP

# Installation
* Download the extension and place all the files in a folder.
* Go to chrome://extensions/
* Enable "Developer Mode" by clicking the slider in the top right corner
* Click on "Load Unpacked"
* Select the folder where the files are located.
* Disable "Developer Mode" by clicking the slider in the top right corner

You are ready to R-Roll.
To disable the extension you just click the slider in the extension box.

# How does it work
Youtube ask "googlevideo.com" for a piece of the video, until it's all loaded.
The extension intercept the request and it changes the query so that when googlevideo.com receives it,
it will reply with clip of NGGYP instead of the real video.
For a more indepth explanation check Notes.txt

# To do List
- [x] Refresh NGGYP links when it expires
- [ ] Resolve "https://www.youtube.com" not equal to "https://www.youtube.com"
- [ ] Force Player to play only Webm/VP9 or supported itag (example: !h264ify)
