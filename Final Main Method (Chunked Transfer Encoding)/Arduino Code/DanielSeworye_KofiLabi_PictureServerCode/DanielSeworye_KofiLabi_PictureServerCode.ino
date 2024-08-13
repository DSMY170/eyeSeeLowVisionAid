/*
  Used  Example guides from: 
    https://www.amebaiot.com/en/ameba-arduino-summary/ 
  to implement this project
 */

#include <WiFi.h>
#include "VideoStream.h"


//------ choose camera settings resolution
#define CHANNEL 0 // 1920 x 1080 @1080p
VideoSetting config(VIDEO_FHD, CAM_FPS, VIDEO_JPEG, 1);

uint32_t img_addr = 0;
uint32_t img_len = 0;


unsigned long lastTime = 0;
unsigned long timerDelay = 15; // x milli seconds



//------------- WIFI SETTIGS
char ssid[] = "EyeSeeLVA"; 
char pass[] = "0123456789";  
int status = WL_IDLE_STATUS;  // Indicator of Wifi status

IPAddress local_IP(192, 168, 137, 1);   // Static Board IP 
IPAddress DNSserver(0, 0, 0, 0);         // DNS Server
IPAddress gateway(192, 168, 137, 1);     // Gateway
IPAddress subnet(255, 255, 255, 0);      // Subnet Mask 


// ------- wifi server and http response settings
WiFiServer server(80);
String header = ""; // Variable to store the HTTP request header

#define PART_BOUNDARY "123456789000000000000987654321"
char* STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
char* IMG_HEADER = "Content-Type: image/jpeg\r\n"
                   "Access-Control-Allow-Origin:*\r\n"
                   "Content-Length: %lu\r\n\r\n";

//----- multipart/x-mixed-replace header
void sendHeader(WiFiClient& client) {
    client.print("HTTP/1.1 200 OK\r\nContent-type: multipart/x-mixed-replace; boundary=");
    client.println(PART_BOUNDARY);
    client.print("Transfer-Encoding: chunked\r\n");
    client.print("Access-Control-Allow-Origin:*\r\n");
    client.print("Cache-Control: no-cache\r\n");
    client.print("\r\n");
}


void sendChunk(WiFiClient& client, uint8_t* chunk_info, uint32_t len) {
    // chunked http 1.1 transfer FORMAT:
    /*
      chunk length in hex\r\n
      chunk data or header info\r\n 
    */
    
    uint8_t chunk_len_hex_buf[16] = {0};
    uint8_t chunk_len = snprintf((char*)chunk_len_hex_buf, 64, "%lX\r\n", len);


    client.write(chunk_len_hex_buf, chunk_len);
    client.write(chunk_info, len);
    client.print("\r\n");
}




void setup() {
    // Initialize serial port
    Serial.begin(115200);
    
    pinMode(LED_B, OUTPUT);    // set the LED pin mode
    digitalWrite(LED_B, LOW);

    /* Configures Static IP Address */
    WiFi.config(local_IP, DNSserver, gateway, subnet);

    // attempt to start AP:
    while (status != WL_CONNECTED) {
        // WiFi.apbegin(ssid, pass, channel, ssid_status);
        // SSID status, 1- hidden, 0- not hidden
        status = WiFi.apbegin(ssid, pass, "1", 0);
        delay(1000);
    }

    /*   DELAY FOR WIFI TO APPEAR ON WIFI MENU*/
    delay(2000);


    Camera.configVideoChannel(CHANNEL, config);
    Camera.videoInit();
    Camera.channelBegin(CHANNEL);

    /* Activate the indicating led */
    for (byte i = 0; i < 10; ++i){
        digitalWrite(LED_B, !digitalRead(LED_B));
        delay(200);
    }
    
    // Serial.println(WiFi.localIP());
    server.begin();

}



void loop() {
    WiFiClient client = server.available();

    if (client) {
        // an http request ends with \r\n\r\n == blank line 
        boolean currentLineIsBlank = true;

        while(client.connected()) {
          
            if (client.available()) {
                char c = client.read();

                /* 
                 *  get only request-line from reequests which is in te form
                 *      HTTP_METHOD   URL   HTTP_VERSION\r\n
                */
                if(header.indexOf("\r") < 0){
                    header += c; // store request-line info
                }

                
                if ((c == '\n') && currentLineIsBlank) {
                    // Serial.println("header: \n" + header);

                    
                    if (header.indexOf("GET /pass") >= 0) {
                        // parse header for passwor in get request url
                        byte startMarker = header.indexOf("?") + 1;
                        byte endMarker = header.indexOf("&");
                        String password = header.substring(startMarker, endMarker);
                        
                        /* store password in flash */


                        // send a http response header with text == password
                        client.println("HTTP/1.1 200 OK");
                        client.print("Access-Control-Allow-Origin:*\r\n");
                        client.println("Content-Type: text/plain");
                        client.println("Connection: close");    // the connection will be closed after completion of the response
                        client.println();

                        /* send password as text to client */
                        client.print(password);

                        break;
                    }


                #if 0 /* to be incoorporated soon */
                    Serial.println("header1: \n");
                    else if (header.indexOf("GET /zoom") >= 0) {
                        // Camera.zoom(2, CHANNEL);
                        // Camera.videoDeinit();
                        // Camera.videoInit();
                    }

                    else if (header.indexOf("GET /bright") >= 0) {
                      constrast = (constrast >= BRIGHTNESS_MAX)? BRIGHTNESS_MAX : constrast + 1;
                      configCam.setBrightness(constrast);
                    } 
                    
                    else if (header.indexOf("GET /dim") >= 0) {
                       constrast = (constrast <= BRIGHTNESS_MIN)? BRIGHTNESS_MIN : constrast - 1;
                       configCam.setBrightness(constrast);
                    } 
                     
                #endif

                    // Serial.println("\nheader2: \n");
                    /* a stream request (default) */
                    sendHeader(client);

                    /* 
                      SEND IMAGE CHUNKS
                        1. header
                        2. image data
                        3. boundary
                    */
                    while (client.connected()) {
                        // delay "timerDelay" ms between succesive pictures
                        if ((millis() - lastTime) > timerDelay) {
                            //Serial.println("Taking...");
                            /* TAKE A PICTURE */
                            Camera.getImage(CHANNEL, &img_addr, &img_len);

    //                        Serial.println("Taken...");
                            /* send the img header */
                            uint8_t chunk_header[128] = {0};
                            uint8_t chunk_header_len = snprintf((char*)chunk_header, 128, 
                                        IMG_HEADER, img_len);
                            sendChunk(client, chunk_header, chunk_header_len);

                            /* send the img */
                            sendChunk(client, (uint8_t*)img_addr, img_len);

                            /* send the STREAM_BOUNDARY */
                            sendChunk(client, (uint8_t*)STREAM_BOUNDARY, strlen(STREAM_BOUNDARY));
                        }

                    }
                    
                    break;
                }   
                
                if (c == '\n') {
                  // you're starting a new line
                  currentLineIsBlank = true;
                } 
                
                else if (c != '\r') {
                    // you've gotten a character on the current line
                    currentLineIsBlank = false;
                }
                
            }
        
        }

        // Clear the header variable
        header = "";
        client.stop();
    } 
    
    
}
