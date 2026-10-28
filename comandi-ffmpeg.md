```
ffmpeg -i "C:\Video\C0001.MP4" -ss 5.000 -t 5.000 -map 0:v:0 -map "0:a?" -c copy -avoid_negative_ts make_zero -movflags +faststart "C:\Output\C0001_001.MP4"
```

funzionante

```
ffmpeg -i "Z:\FIGHTTANK\VIDEO\20261024 - Val Cavanata\SONY CUPPI\20261025_VID1929.MP4" -ss 0 -t 10 -map 0:v:0 -map 0:a? -c copy -avoid_negative_ts make_zero -movflags +faststart "C:\Users\Andrea\Desktop\tst ffmpeg\20261025_VID1929.MP4"
```


funzionante con metadati




```
ffmpeg -i "Z:\FIGHTTANK\VIDEO\20261024 - Val Cavanata\SONY DIMO\VIDEO\C0002.MP4" -ss 5.2 -t 10 -map 0:v:0 -map 0:a?  -map_metadata 0 -map_metadata:s:v 0:s:v:0 -c copy -avoid_negative_ts make_zero -movflags +faststart "C:\Users\Andrea\Desktop\tst ffmpeg\c0002.MP4"
```


```
ffmpeg -i "Z:\FIGHTTANK\VIDEO\20261024 - Val Cavanata\SONY CUPPI\20261025_VID1929.MP4" -ss 4.45 -t 10 -map 0:v:0 -map 0:a?  -map_metadata 0 -map_metadata:s:v 0:s:v:0 -c copy -avoid_negative_ts make_zero -movflags +faststart "C:\Users\Andrea\Desktop\tst ffmpeg\20261025_VID1929.MP4"
```



313 / 60 = 5,216

(913 - 313) / 60 = 10