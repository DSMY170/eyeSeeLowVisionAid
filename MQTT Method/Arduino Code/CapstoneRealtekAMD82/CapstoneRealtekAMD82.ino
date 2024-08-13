#include <WiFi.h>
#include "VideoStream.h"
#include <PubSubClient.h> // FOR Mqtt



// ------------- CAMERA SETTINGS
#define CHANNEL 0

// Use a 1080p resolution @ 30 fps frame rate
VideoSetting config(VIDEO_FHD, CAM_FPS, VIDEO_JPEG, 1);

uint32_t img_addr = 0;
uint32_t img_len = 0;


//-------------- mqtt settings
WiFiClient Amebaclient;
PubSubClient MQTTclient(Amebaclient); // Setup MQTT client

/* MQTT DETAILS */
const char* mqtt_broker = "broker.hivemq.com";
//const char* mqtt_broker = "172.20.47.115"; // for local broker by IP
const char* ID = "WPA2_AMEBA_ASHfff"; // random name
const char* outtopic1 = "images/newVersionLivestreamAmeba"; // publishing topic
const char* mytopic = "images/AmebaDone"; // receipt topic
const int mqtt_port = 1883;
const unsigned char* payLoad;
byte received = 0;


void PublishImage(const char* outtopic){
   payLoad = (uint8_t *) img_addr; // cpmnvert image to byte array

   // imcrease buffer size to hold byte array: default buffer size is 256
   MQTTclient.setBufferSize((uint16_t) (img_len + 128) );

   int state = MQTTclient.publish(outtopic, payLoad, img_len, false);

  //Serial.println("Succesful : " + String((state)? "True":"False"));

  //Serial.print("Published info: 0x ");
  //Serial.print(img_addr, HEX);
  //Serial.println(" , length: " + String(img_len));
}


void callback(char* topic, byte* payload, unsigned int len){
    String message;
    
    for (int i = 0; i < len; i++) {
      message += (char) payload[i];
    }

    Serial.print("Message arrived on [");
    Serial.print(topic);
    Serial.print("] : ");
    Serial.println(message);
}



// ------------- WIFI SETTIGS
char ssid[] = "Type your network SSID here";   // your network SSID (name)
char pass[] = "Type your network password here"; // your network password

int status = WL_IDLE_STATUS;


unsigned long lastTime = 0;
unsigned long timerDelay = 5; // x milli seconds

/*
 * ================= Main Set-up 
 */
void setup() {
    Serial.begin(115200);

    // connect to wifi
    while (status != WL_CONNECTED) {
        status = WiFi.begin(ssid, pass);
    }
    
    // set up Camera
    Camera.configVideoChannel(CHANNEL, config);
    Camera.videoInit();
    Camera.channelBegin(CHANNEL);

    Serial.print("Connected with IP Address : ");
    Serial.println(WiFi.localIP());


    MQTTclient.setServer(mqtt_broker, mqtt_port); 
    MQTTclient.setCallback(callback);
}


void loop() {
    if (!MQTTclient.connected()){ // Reconnect if connection is lost
        reconnect();
    }
    
    // delay "timerDelay" ms between succesive pictures
    if ((millis() - lastTime) > timerDelay) {
      // take a picture
      Camera.getImage(CHANNEL, &img_addr, &img_len);
      PublishImage(outtopic1);

      lastTime = millis();
    }
    
    MQTTclient.loop();
    
}


void reconnect() {
  // Loop until we're reconnected
  while (!MQTTclient.connected()) {
    //Serial.println("\nAttempting MQTT connection...");
    // Attempt to connect
    if (MQTTclient.connect(ID)) {
        MQTTclient.subscribe(mytopic);
        //Serial.print("Subscribed to: [");
        //Serial.println(mytopic);
        //Serial.println("]");
     } 
  }  

}
