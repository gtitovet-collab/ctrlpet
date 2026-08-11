# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# -------------------------------------------------------
# Capacitor Bridge — obrigatório para o WebView funcionar
# -------------------------------------------------------
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.PluginMethod public *;
}

# Interface JavaScript do WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Classes do próprio app
-keep class com.ctrlpet.meuapp.** { *; }

# Plugins do Capacitor
-keep class com.capacitorjs.plugins.** { *; }

# Preserva informações para análise de crashes no Logcat e Play Console
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Suppress warnings for missing classes in third-party libs
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
