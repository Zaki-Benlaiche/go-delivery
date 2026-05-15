# ============================================================================
# ProGuard / R8 rules for the Capacitor WebView app.
# Goal: aggressive shrink + obfuscation while preserving anything the runtime
# (Capacitor bridge, JavaScript interface, plugin reflection) loads by name.
# ============================================================================

# --- Capacitor core + plugin reflection ---
# Capacitor reflects on plugin classes by name from the JS bridge. R8 must
# keep the public surface intact or the bridge throws ClassNotFoundException.
-keep public class com.getcapacitor.** { *; }
-keep public class com.capacitorjs.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod *;
}

# Plugin classes annotated with the legacy @NativePlugin marker (Cordova-era
# bridge still used by some community plugins).
-keep @com.getcapacitor.NativePlugin public class * { *; }

# --- WebView <-> JavaScript bridge ---
# Anything exposed via @JavascriptInterface must keep its method signatures.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# --- The app's own entry points ---
-keep public class com.godelivery.app.** { *; }

# --- AndroidX / WebView baseline (kept by the platform anyway, listed for clarity) ---
-keep class androidx.webkit.** { *; }
-dontwarn androidx.webkit.**

# --- Drop verbose log lines in release for a small dex saving + cleaner logcat ---
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
}

# --- Keep stack traces meaningful (but obfuscated). Without these, crash
# reports come back as one-line "<unknown>" and are useless to debug. ---
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# --- Cordova-plugin compatibility shim (Capacitor still loads cordova-android
# plugins through this layer when present). ---
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**
