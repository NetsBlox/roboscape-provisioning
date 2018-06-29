package com.example.android.basicnetworking;
import android.app.Activity;
import android.content.Context;
import android.net.wifi.WifiManager;
import android.os.Handler;
import android.os.Looper;
import com.example.android.basicnetworking.HotSpotCB;
import com.example.android.common.logger.LogView;

public class HotSpot {
    private Context ctx;
    private WifiManager wm;

    public HotSpot(Context ctx) {
        wm = ctx.getSystemService(WifiManager.class);
    }

    public void start(WifiManager.LocalOnlyHotspotCallback createCb) {
        wm.startLocalOnlyHotspot(createCb,new Handler());
    }
}

