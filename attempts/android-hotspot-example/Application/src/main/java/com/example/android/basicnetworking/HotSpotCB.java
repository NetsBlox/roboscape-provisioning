package com.example.android.basicnetworking;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiManager;
import com.example.android.common.logger.LogView;

public class HotSpotCB extends WifiManager.LocalOnlyHotspotCallback{
    private LogView log;


    public HotSpotCB(LogView log) {
        super();
        this.log = log;
    }

    @Override
    public void onFailed(int reason) {
        super.onFailed(reason);
        this.log.setText("failed");
    }

    @Override
    public void onStarted(WifiManager.LocalOnlyHotspotReservation reservation) {
        super.onStarted(reservation);
        WifiConfiguration mWifiConfig = reservation.getWifiConfiguration();
        this.log.setText(new StringBuilder().append("started + \n ").append(mWifiConfig.SSID).append(" ").append(mWifiConfig.preSharedKey).toString());
    }

    @Override
    public void onStopped() {
        super.onStopped();
        this.log.setText("stopped");
    }
}
