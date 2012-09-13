package org.example.myprofile;

import org.apache.cordova.DroidGap;

import android.os.Bundle;

public class ProfileActivity extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
//        setContentView(R.layout.activity_profile);
        
//        super.setIntegerProperty("splashscreen", );
        super.splashscreen = R.drawable.splash;
        super.showSplashScreen(10000000);
        super.loadUrl("file:///android_asset/www/index.html");
    }

//    @Override
//    public boolean onCreateOptionsMenu(Menu menu) {
//        getMenuInflater().inflate(R.menu.activity_profile, menu);
//        return true;
//    }

    
}
