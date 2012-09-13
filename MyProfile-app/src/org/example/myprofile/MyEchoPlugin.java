package org.example.myprofile;

import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;
import org.json.JSONArray;

import android.util.Log;

import com.phonegap.api.Plugin;

/**
 * Beispiel für ein Plugin.
 * 
 * @author asiebert
 */
public class MyEchoPlugin extends Plugin {

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action 		The action to execute.
     * @param args 			JSONArry of arguments for the plugin.
     * @param callbackId	The callback id used when calling back into JavaScript.
     * @return 				A PluginResult object with a status and message.
     */
	@Override
	public PluginResult execute(final String action, final JSONArray args, final String callbackId) {
		if( !"echo".equals( action ) ) {
			return new PluginResult(Status.ERROR);
		}
		
		final PluginResult r = new PluginResult(Status.OK);
	    
		Log.d("test-plugin", "Test plugin ausgeführt" );
		
		// TODO Auto-generated method stub
		return r;
	}
	
	

}
